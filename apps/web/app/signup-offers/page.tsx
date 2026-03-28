import { getAllSignupOffers } from "@/lib/data";
import { SignupOffersBrowser } from "@/components/signup-offers-browser";

export default async function SignupOffersPage() {
  const offers = await getAllSignupOffers();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Signup Offers</h1>
        <p className="mt-2 max-w-3xl text-white/60">
          Explore signup campaigns across banks, including reward values, minimum spend
          requirements, exclusivity, and promo details.
        </p>
      </div>

      <SignupOffersBrowser offers={offers} />
    </main>
  );
}