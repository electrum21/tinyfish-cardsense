import json
import requests
from datetime import datetime
from typing import Any, Dict, List, Optional

# ==========================================
# CONFIG
# ==========================================
SUPABASE_URL = "SUPABASE_URL"
SUPABASE_KEY = "SUPABASE_SERVICE_ROLE_KEY"  # server-side only

INPUT_FILE = "INPUT_FILE_NAME"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

TABLE_INGESTION_RUNS = "ingestion_runs"
TABLE_CASHBACK_CARDS = "cashback_cards"
TABLE_SIGNUP_OFFERS = "signup_offers"
TABLE_MERCHANT_OFFERS = "merchant_offers"


# ==========================================
# HELPERS
# ==========================================
def post_batch(table_name: str, rows: List[Dict[str, Any]], batch_size: int = 100) -> None:
    if not rows:
        print(f"ℹ️ No rows to insert into {table_name}")
        return

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/{table_name}",
            headers=HEADERS,
            json=batch,
            timeout=60,
        )

        if res.status_code not in (200, 201):
            print(f"❌ Error inserting into {table_name}, batch {i // batch_size + 1}: {res.text}")
        else:
            print(f"✅ Inserted batch {i // batch_size + 1} into {table_name}")


def safe_json_loads(raw: str) -> List[Dict[str, Any]]:
    raw = raw.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []


def extract_offers(run: Dict[str, Any]) -> List[Dict[str, Any]]:
    final = run.get("final_run_data", {})
    result = final.get("result", {})

    if isinstance(result, dict):
        if isinstance(result.get("result"), list):
            return result["result"]
        if isinstance(result.get("cards"), list):
            return result["cards"]
        if isinstance(result.get("result"), str):
            return safe_json_loads(result["result"])

    return []


def parse_date(value: Optional[str]) -> Optional[str]:
    if not value or not isinstance(value, str):
        return None

    value = value.strip()
    if not value:
        return None

    # Accept YYYY-MM-DD directly
    try:
        dt = datetime.strptime(value, "%Y-%m-%d")
        return dt.date().isoformat()
    except ValueError:
        pass

    # Accept ISO timestamps like 2026-03-28T04:39:32Z
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return dt.date().isoformat()
    except ValueError:
        return None


def to_numeric(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def to_int(value: Any) -> Optional[int]:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        try:
            return int(float(value))
        except (TypeError, ValueError):
            return None


def normalize_ingestion_run(run: Dict[str, Any], imported_count: int) -> Dict[str, Any]:
    final = run.get("final_run_data", {})
    return {
        "source_name": run.get("category_name"),
        "source_url": run.get("url"),
        "tinyfish_run_id": run.get("run_id"),
        "tinyfish_status": final.get("status"),
        "records_imported": imported_count,
        "payload": run,
    }


def normalize_cashback_card(run: Dict[str, Any], offer: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "source": run.get("category_name"),
        "source_url": run.get("url"),
        "tinyfish_run_id": run.get("run_id"),
        "bank": offer.get("bank"),
        "card_name": offer.get("cardName"),
        "card_type": offer.get("cardType"),
        "cashback_rates": offer.get("cashbackRates"),
        "minimum_monthly_spend": to_numeric(offer.get("minimumMonthlySpend")),
        "monthly_cap_sgd": to_numeric(offer.get("monthlyCapSGD")),
        "payout_cycle": offer.get("payoutCycle"),
        "annual_fee": offer.get("annualFee"),
        "income_requirement": to_numeric(offer.get("incomeRequirement")),
        "special_conditions": offer.get("specialConditions"),
        "signup_bonus": offer.get("signupBonus"),
        "raw_payload": offer,
    }


def normalize_signup_offer(run: Dict[str, Any], offer: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "source": run.get("category_name"),
        "source_url": run.get("url"),
        "tinyfish_run_id": run.get("run_id"),
        "bank": offer.get("bank"),
        "card_name": offer.get("cardName"),
        "card_type": offer.get("cardType"),
        "reward_value": offer.get("rewardValue"),
        "reward_description": offer.get("rewardDescription"),
        "minimum_spend_to_unlock": to_numeric(offer.get("minimumSpendToUnlock")),
        "spend_within_days": to_int(offer.get("spendWithinDays")),
        "promo_expiry_date": parse_date(offer.get("promoExpiryDate")),
        "annual_fee": offer.get("annualFee"),
        "is_exclusive_deal": offer.get("isExclusive"),
        "exclusive_promo_code": offer.get("promoCode"),
        "apply_url": run.get("url"),
        "raw_payload": offer,
    }


def normalize_merchant_offer(run: Dict[str, Any], offer: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "source": run.get("category_name"),
        "source_url": run.get("url"),
        "tinyfish_run_id": run.get("run_id"),
        "category": offer.get("category"),
        "merchant": offer.get("merchant"),
        "cashback_rate": offer.get("cashbackRate"),
        "cashback_rate_number": to_numeric(offer.get("cashbackRateNumber")),
        "raw_payload": offer,
    }


def classify_and_normalize(run: Dict[str, Any], offer: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    category_name = (run.get("category_name") or "").upper()

    if category_name == "BANK_CASHBACK":
        return {"table": TABLE_CASHBACK_CARDS, "row": normalize_cashback_card(run, offer)}

    if category_name == "BANK_SIGNUP":
        return {"table": TABLE_SIGNUP_OFFERS, "row": normalize_signup_offer(run, offer)}

    if category_name == "SHOPBACK":
        return {"table": TABLE_MERCHANT_OFFERS, "row": normalize_merchant_offer(run, offer)}

    return None


# ==========================================
# MAIN
# ==========================================
def main() -> None:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    ingestion_rows: List[Dict[str, Any]] = []
    cashback_rows: List[Dict[str, Any]] = []
    signup_rows: List[Dict[str, Any]] = []
    merchant_rows: List[Dict[str, Any]] = []

    for run in data.get("results", []):
        final = run.get("final_run_data", {})

        if final.get("status") != "COMPLETED":
            continue

        offers = extract_offers(run)
        imported_count = 0

        for offer in offers:
            normalized = classify_and_normalize(run, offer)
            if not normalized:
                continue

            imported_count += 1
            table = normalized["table"]
            row = normalized["row"]

            if table == TABLE_CASHBACK_CARDS:
                cashback_rows.append(row)
            elif table == TABLE_SIGNUP_OFFERS:
                signup_rows.append(row)
            elif table == TABLE_MERCHANT_OFFERS:
                merchant_rows.append(row)

        ingestion_rows.append(normalize_ingestion_run(run, imported_count))

    print(f"Prepared {len(ingestion_rows)} ingestion_runs rows")
    print(f"Prepared {len(cashback_rows)} cashback_cards rows")
    print(f"Prepared {len(signup_rows)} signup_offers rows")
    print(f"Prepared {len(merchant_rows)} merchant_offers rows")

    post_batch(TABLE_INGESTION_RUNS, ingestion_rows)
    post_batch(TABLE_CASHBACK_CARDS, cashback_rows)
    post_batch(TABLE_SIGNUP_OFFERS, signup_rows)
    post_batch(TABLE_MERCHANT_OFFERS, merchant_rows)

    print("🎉 Done!")


if __name__ == "__main__":
    main()