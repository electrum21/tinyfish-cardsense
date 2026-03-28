import type { TinyFishRecord } from "../types.js";

function parseLooseJson(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  const cleaned = value
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function extractTinyFishItems(record: TinyFishRecord): unknown[] {
  return parseLooseJson(record.final_run_data?.result?.result);
}

export function classifyRecord(record: TinyFishRecord) {
  const category = record.category_name.toUpperCase();

  if (category === "BANK_CASHBACK") return "cashback_cards" as const;
  if (category === "BANK_SIGNUP" || category === "SINGSAVER" || category === "MONEYSMART") return "signup_offers" as const;
  if (category === "SHOPBACK") return "merchant_offers" as const;
  if (category === "EATIGO") return "restaurant_deals" as const;

  return "unknown" as const;
}

