import cors from "cors";
import express from "express";
import { z } from "zod";
import { env } from "./config.js";
import { supabaseAdmin } from "./lib/supabase.js";
import { ingestTinyFishPayload } from "./services/ingest.js";
import { buildAiRecommendation, fetchDashboardData } from "./services/insights.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/health/db", async (_request, response) => {
  const { error } = await supabaseAdmin.from("cashback_cards").select("id").limit(1);

  response.json({
    ok: !error,
    supabase: error ? "error" : "connected"
  });
});

app.get("/api/summary", async (_request, response, next) => {
  try {
    const snapshot = await fetchDashboardData();

    const overview = {
      cashback_card_count: snapshot.cashbackCards.length,
      signup_offer_count: snapshot.signupOffers.length,
      merchant_offer_count: snapshot.merchantOffers.length,
      max_merchant_cashback_rate:
        snapshot.merchantOffers[0]?.cashback_rate_number ?? null,
      exclusive_signup_offer_count: snapshot.signupOffers.filter(
        (offer) => offer.is_exclusive_deal
      ).length
    };

    response.json({
      overview,
      spotlight: {
        topMerchantOffer: snapshot.merchantOffers[0] ?? null,
        topSignupOffer: snapshot.signupOffers[0] ?? null,
        topCashbackCard: snapshot.cashbackCards[0] ?? null
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/collections", async (_request, response, next) => {
  try {
    const snapshot = await fetchDashboardData();

    response.json({
      cashbackCards: snapshot.cashbackCards.slice(0, 8),
      signupOffers: snapshot.signupOffers.slice(0, 8),
      merchantOffers: snapshot.merchantOffers.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
});


app.post("/api/recommendations", async (request, response, next) => {
  const bodySchema = z.object({
    preferences: z.string().min(10)
  });

  try {
    const body = bodySchema.parse(request.body);
    const recommendation = await buildAiRecommendation(body.preferences);
    response.json(recommendation);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", error);

  if (error instanceof z.ZodError) {
    return response.status(400).json({
      error: "Invalid request body",
      details: error.flatten()
    });
  }

  if (error instanceof Error) {
    return response.status(500).json({
      error: error.message
    });
  }

  return response.status(500).json({
    error: "Non-Error thrown",
    details: error
  });
});

app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});