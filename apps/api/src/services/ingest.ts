import { supabaseAdmin } from "../lib/supabase.js";
import { classifyRecord, extractTinyFishItems } from "./tinyfish.js";
import type { TinyFishRecord } from "../types.js";

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function asJson(value: unknown) {
  return value ?? null;
}

async function upsertCashbackCards(record: TinyFishRecord, items: Record<string, unknown>[]) {
  const payload = items.map((item) => ({
    source: record.category_name,
    source_url: record.url,
    tinyfish_run_id: record.run_id,
    bank: asString(item.bank) ?? "Unknown Bank",
    card_name: asString(item.cardName) ?? "Unknown Card",
    card_type: asString(item.cardType),
    cashback_rates: asJson(item.cashbackRates),
    minimum_monthly_spend: asNumber(item.minimumMonthlySpend),
    monthly_cap_sgd: asNumber(item.monthlyCapSGD),
    payout_cycle: asString(item.payoutCycle),
    annual_fee: asString(item.annualFee),
    income_requirement: asNumber(item.incomeRequirement),
    special_conditions: asString(item.specialConditions),
    signup_bonus: asString(item.signupBonus),
    raw_payload: item
  }));

  if (payload.length === 0) return 0;

  const { error } = await supabaseAdmin.from("cashback_cards").upsert(payload, {
    onConflict: "source,card_name,bank"
  });

  if (error) throw error;
  return payload.length;
}

async function upsertSignupOffers(record: TinyFishRecord, items: Record<string, unknown>[]) {
  const payload = items.map((item) => ({
    source: record.category_name,
    source_url: record.url,
    tinyfish_run_id: record.run_id,
    bank: asString(item.bank) ?? "Unknown Bank",
    card_name: asString(item.cardName) ?? "Unknown Card",
    card_type: asString(item.cardType),
    reward_value: asString(item.rewardValue),
    reward_description: asString(item.rewardDescription),
    minimum_spend_to_unlock: asNumber(item.minimumSpendToUnlock),
    spend_within_days: asNumber(item.spendWithinDays),
    promo_expiry_date: asString(item.promoExpiryDate),
    annual_fee: asString(item.annualFee),
    is_exclusive_deal: asBoolean(item.isExclusiveDeal),
    exclusive_promo_code: asString(item.exclusivePromoCode),
    extra_gift: asString(item.extraGift),
    estimated_total_value: asString(item.estimatedTotalValue),
    apply_url: asString(item.applyUrl),
    raw_payload: item
  }));

  if (payload.length === 0) return 0;

  const { error } = await supabaseAdmin.from("signup_offers").upsert(payload, {
    onConflict: "source,card_name,bank"
  });

  if (error) throw error;
  return payload.length;
}

async function upsertMerchantOffers(record: TinyFishRecord, items: Record<string, unknown>[]) {
  const payload = items.map((item) => ({
    source: record.category_name,
    source_url: record.url,
    tinyfish_run_id: record.run_id,
    category: asString(item.category),
    merchant: asString(item.merchant) ?? "Unknown Merchant",
    cashback_rate: asString(item.cashbackRate),
    cashback_rate_number: asNumber(item.cashbackRateNumber),
    is_upsized: asBoolean(item.isUpsized),
    regular_rate: asString(item.regularRate),
    eligible_cards: asJson(item.eligibleCards),
    valid_until: asString(item.validUntil),
    min_spend: asNumber(item.minSpend),
    max_cashback: asNumber(item.maxCashback),
    promo_code: asString(item.promoCode),
    is_card_linked: asBoolean(item.isCardLinked),
    raw_payload: item
  }));

  if (payload.length === 0) return 0;

  const { error } = await supabaseAdmin.from("merchant_offers").upsert(payload, {
    onConflict: "source,merchant,category"
  });

  if (error) throw error;
  return payload.length;
}

async function insertRestaurantDeals(record: TinyFishRecord, items: Record<string, unknown>[]) {
  const payload = items.map((item) => ({
    source: record.category_name,
    source_url: record.url,
    tinyfish_run_id: record.run_id,
    restaurant_name: asString(item.restaurantName) ?? asString(item.name) ?? "Unknown Restaurant",
    cuisine: asString(item.cuisine),
    location: asString(item.location),
    offer_title: asString(item.offerTitle),
    offer_details: asString(item.offerDetails) ?? asString(item.description),
    discount_value: asString(item.discountValue) ?? asString(item.discount),
    booking_url: asString(item.bookingUrl),
    raw_payload: item
  }));

  if (payload.length === 0) return 0;

  const { error } = await supabaseAdmin.from("restaurant_deals").insert(payload);

  if (error) throw error;
  return payload.length;
}

export async function ingestTinyFishPayload(payload: { results?: TinyFishRecord[] }) {
  const results = payload.results ?? [];
  let recordsImported = 0;

  for (const record of results) {
    const table = classifyRecord(record);
    const items = extractTinyFishItems(record).filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null
    );

    let inserted = 0;

    if (table === "cashback_cards") inserted = await upsertCashbackCards(record, items);
    if (table === "signup_offers") inserted = await upsertSignupOffers(record, items);
    if (table === "merchant_offers") inserted = await upsertMerchantOffers(record, items);
    if (table === "restaurant_deals") inserted = await insertRestaurantDeals(record, items);

    recordsImported += inserted;

    const { error } = await supabaseAdmin.from("ingestion_runs").insert({
      source_name: record.category_name,
      source_url: record.url,
      tinyfish_run_id: record.run_id,
      tinyfish_status: record.final_run_data?.status ?? null,
      records_imported: inserted,
      payload: record
    });

    if (error) throw error;
  }

  return {
    categoriesProcessed: results.length,
    recordsImported
  };
}

