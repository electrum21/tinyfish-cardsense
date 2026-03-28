import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
  INGEST_SHARED_SECRET: z.string().min(1),
  TINYFISH_API_KEY: z.string().optional(),
  TINYFISH_BASE_URL: z.string().url().default("https://api.tinyfish.ai")
});

export const env = envSchema.parse(process.env);

