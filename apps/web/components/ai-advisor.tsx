"use client";

import { useState, useTransition } from "react";
import { env } from "@/lib/env";

export function AiAdvisor() {
  const [preferences, setPreferences] = useState(
    "I spend heavily on dining, online shopping, and one regional trip a quarter. I prefer waived annual fees and strong signup gifts."
  );
  const [answer, setAnswer] = useState(
    "Ask for a recommendation after your Render backend is live. The response will use the live Supabase data set."
  );
  const [isPending, startTransition] = useTransition();

  return (
    <div className="ai-card">
      <div>
        <div className="badge">AI Concierge</div>
        <h3>Turn raw scrape output into a decision-ready recommendation.</h3>
        <p className="muted">
          This panel calls your Render backend, which uses OpenAI against the latest records stored in Supabase.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            try {
              const response = await fetch(`${env.apiBaseUrl}/api/recommendations`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ preferences })
              });

              const payload = (await response.json()) as { answer?: string; error?: string };
              setAnswer(payload.answer ?? payload.error ?? "No recommendation returned.");
            } catch {
              setAnswer("The API is unreachable right now. Once the Render service is deployed, this advisor will respond here.");
            }
          });
        }}
      >
        <textarea value={preferences} onChange={(event) => setPreferences(event.target.value)} />
        <button className="button-primary" type="submit" disabled={isPending}>
          {isPending ? "Thinking..." : "Generate Recommendation"}
        </button>
      </form>

      <div className="ai-response">{answer}</div>
    </div>
  );
}

