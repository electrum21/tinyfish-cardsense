import { env } from "./env";
import { createSupabaseServerClient } from "./supabase";

type SummaryPayload = {
  overview: {
    cashback_card_count: number;
    signup_offer_count: number;
    merchant_offer_count: number;
    restaurant_deal_count: number;
    exclusive_signup_offer_count: number;
    max_merchant_cashback_rate: number | null;
    bank_count: number;
  };
  spotlight: {
    topMerchantOffer: Record<string, unknown> | null;
    topSignupOffer: Record<string, unknown> | null;
    topCashbackCard: Record<string, unknown> | null;
  };
};

export async function getSummary() {
  try {
    const response = await fetch(`${env.apiBaseUrl}/api/summary`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch API summary");
    }

    return (await response.json()) as SummaryPayload;
  } catch {
    return {
      overview: {
        cashback_card_count: 0,
        signup_offer_count: 0,
        merchant_offer_count: 0,
        restaurant_deal_count: 0,
        exclusive_signup_offer_count: 0,
        max_merchant_cashback_rate: null,
        bank_count: 0
      },
      spotlight: {
        topMerchantOffer: null,
        topSignupOffer: null,
        topCashbackCard: null
      }
    } satisfies SummaryPayload;
  }
}

export async function getSupabaseCollections() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      cashbackCards: [],
      signupOffers: [],
      merchantOffers: []
    };
  }

  const [{ data: cashbackCards }, { data: signupOffers }, { data: merchantOffers }] = await Promise.all([
    supabase.from("cashback_cards").select("*").limit(8),
    supabase.from("signup_offers").select("*").limit(8),
    supabase.from("merchant_offers").select("*").limit(8)
  ]);

  return {
    cashbackCards: cashbackCards ?? [],
    signupOffers: signupOffers ?? [],
    merchantOffers: merchantOffers ?? []
  };
}
