import { AiAdvisor } from "@/components/ai-advisor";
import { getSummary, getSupabaseCollections } from "@/lib/data";

function formatSpotlight(item: Record<string, unknown> | null) {
  if (!item) return "Connect Supabase to surface a live spotlight offer.";
  return `${item.card_name ?? item.merchant ?? "Offer"}${item.bank ? ` from ${item.bank}` : ""}`;
}

export default async function HomePage() {
  const [summary, collections] = await Promise.all([getSummary(), getSupabaseCollections()]);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">TinyFish x Supabase x Vercel x Render</div>

        <div className="hero-grid">
          <div className="hero-copy">
            <h1>Singapore card intelligence, turned into a product.</h1>
            <p>
              This app transforms TinyFish scrape runs into a polished decision dashboard. It centralizes cashback cards,
              signup offers, merchant rebates, and dining perks in Supabase, then layers on Render-hosted APIs and an AI
              concierge for recommendations.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#dashboard">
                Explore Dashboard
              </a>
              <a className="button-secondary" href="#advisor">
                Try AI Concierge
              </a>
            </div>
          </div>

          <div className="hero-panel">
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Cashback Cards</div>
                <div className="stat-value">{summary.overview.cashback_card_count}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Signup Offers</div>
                <div className="stat-value">{summary.overview.signup_offer_count}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Merchant Cashback High</div>
                <div className="stat-value">
                  {summary.overview.max_merchant_cashback_rate ? `${summary.overview.max_merchant_cashback_rate}%` : "--"}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Exclusive Offers</div>
                <div className="stat-value">{summary.overview.exclusive_signup_offer_count}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="dashboard">
        <div className="section-head">
          <div>
            <h2>What the app highlights</h2>
            <p>
              The frontend is designed to feel demo-ready while staying practical for Vercel hosting. Data is read from
              Supabase and enriched by the Render API.
            </p>
          </div>
        </div>

        <div className="spotlight-grid">
          <article className="section-card">
            <div className="badge-row">
              <div className="badge">Top Cashback Card</div>
            </div>
            <h3>{formatSpotlight(summary.spotlight.topCashbackCard)}</h3>
            <p>Normalize bank card catalogs into a searchable layer with spend thresholds, caps, fees, and bonus context.</p>
          </article>

          <article className="section-card">
            <div className="badge-row">
              <div className="badge">Top Signup Promo</div>
            </div>
            <h3>{formatSpotlight(summary.spotlight.topSignupOffer)}</h3>
            <p>Elevate campaign offers from banks and aggregators into a single conversion surface with expiry visibility.</p>
          </article>

          <article className="section-card">
            <div className="badge-row">
              <div className="badge">Merchant Boost</div>
            </div>
            <h3>{formatSpotlight(summary.spotlight.topMerchantOffer)}</h3>
            <p>Surface upsized cashback from ShopBack and connect it to card strategy for practical stacking ideas.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="table-grid">
          <div className="table-card">
            <div className="section-head">
              <div>
                <h2>Latest Cards From Supabase</h2>
                <p>Recent bank cashback cards normalized out of the TinyFish payload.</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Bank</th>
                  <th>Type</th>
                  <th>Annual Fee</th>
                </tr>
              </thead>
              <tbody>
                {collections.cashbackCards.length > 0 ? (
                  collections.cashbackCards.map((card) => (
                    <tr key={String(card.id)}>
                      <td>{String(card.card_name ?? "--")}</td>
                      <td>{String(card.bank ?? "--")}</td>
                      <td>{String(card.card_type ?? "--")}</td>
                      <td>{String(card.annual_fee ?? "--")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="muted">
                      Add Supabase credentials and ingest TinyFish results to populate this table.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-card">
            <div className="section-head">
              <div>
                <h2>Best Merchant Offers</h2>
                <p>High-value ShopBack merchant payouts, ready for stacking logic.</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Rate</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {collections.merchantOffers.length > 0 ? (
                  collections.merchantOffers.map((offer) => (
                    <tr key={String(offer.id)}>
                      <td>{String(offer.merchant ?? "--")}</td>
                      <td>{String(offer.cashback_rate ?? "--")}</td>
                      <td>{String(offer.category ?? "--")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="muted">
                      Merchant rows will appear after your first import run.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="table-card">
          <div className="section-head">
            <div>
              <h2>Signup Offers</h2>
              <p>Curated signup campaigns from banks and aggregators, stored in Supabase for flexible ranking.</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Card</th>
                <th>Bank</th>
                <th>Reward</th>
                <th>Spend Rule</th>
              </tr>
            </thead>
            <tbody>
              {collections.signupOffers.length > 0 ? (
                collections.signupOffers.map((offer) => (
                  <tr key={String(offer.id)}>
                    <td>{String(offer.card_name ?? "--")}</td>
                    <td>{String(offer.bank ?? "--")}</td>
                    <td>{String(offer.reward_description ?? offer.reward_value ?? "--")}</td>
                    <td>
                      {offer.minimum_spend_to_unlock
                        ? `S$${offer.minimum_spend_to_unlock} in ${offer.spend_within_days ?? "--"} days`
                        : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="muted">
                    Signup campaigns will load here after the first TinyFish import.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="advisor">
        <div className="section-head">
          <div>
            <h2>Recommendation Layer</h2>
            <p>Use OpenAI on the backend to synthesize live Supabase records into a tailored card shortlist.</p>
          </div>
        </div>

        <AiAdvisor />
      </section>

      <footer className="footer">
        Built for a TinyFish-powered credit intelligence workflow with Supabase persistence, a Render backend, and a
        Vercel frontend.
      </footer>
    </main>
  );
}
