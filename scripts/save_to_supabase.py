import json
import requests

# ==========================================
# CONFIG
# ==========================================
SUPABASE_URL = "SUPABASE_URL"
SUPABASE_KEY = "SUPABASE_KEY"  # server-side only
TABLE_NAME = "tinyfish_offers"

INPUT_FILE = "tinyfish_async_results_20260328_124339.json"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"  # enables upsert
}

# ==========================================
# HELPERS
# ==========================================
def extract_offers(run):
    final = run.get("final_run_data", {})
    result = final.get("result", {})

    # Case 1: result.result
    if isinstance(result.get("result"), list):
        return result["result"]

    # Case 2: result.cards
    if isinstance(result.get("cards"), list):
        return result["cards"]

    # Case 3: stringified JSON
    if isinstance(result.get("result"), str):
        raw = result["result"]
        raw = raw.replace("```json", "").replace("```", "").strip()
        try:
            return json.loads(raw)
        except:
            return []

    return []


def normalize(run, offer):
    return {
        "source_run_id": run.get("run_id"),
        "category_name": run.get("category_name"),
        "source_url": run.get("url"),

        "bank": offer.get("bank"),
        "card_name": offer.get("cardName"),
        "merchant": offer.get("merchant"),

        "card_type": offer.get("cardType"),
        "reward_type": offer.get("rewardType"),
        "reward_value": offer.get("rewardValue"),

        "annual_fee": offer.get("annualFee"),
        "promo_code": offer.get("promoCode"),

        "minimum_spend_to_unlock": offer.get("minimumSpendToUnlock"),
        "monthly_cap_sgd": offer.get("monthlyCapSGD"),

        "cashback_rate": offer.get("cashbackRate"),
        "cashback_rate_number": offer.get("cashbackRateNumber"),
        "cashback_rates": offer.get("cashbackRates"),

        "raw_offer": offer
    }


# ==========================================
# MAIN
# ==========================================
def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    rows = []

    for run in data.get("results", []):
        final = run.get("final_run_data", {})
        
        if final.get("status") != "COMPLETED":
            continue

        offers = extract_offers(run)

        for offer in offers:
            rows.append(normalize(run, offer))

    print(f"Prepared {len(rows)} rows")

    # ==========================================
    # INSERT TO SUPABASE (BATCH)
    # ==========================================
    batch_size = 100

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]

        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}",
            headers=HEADERS,
            json=batch
        )

        if res.status_code not in (200, 201):
            print("❌ Error:", res.text)
        else:
            print(f"✅ Inserted batch {i // batch_size + 1}")

    print("🎉 Done!")


if __name__ == "__main__":
    main()