import { getAllSignupOffers } from "@/lib/data";
import { SignupOffersBrowser } from "@/components/signup-offers-browser";

export default async function SignupOffersPage() {
  const offers = await getAllSignupOffers();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Signup Offers</h1>
        <p className="mt-2 max-w-5xl text-white/60">
          Explore signup campaigns across banks, including reward values, minimum spend
          requirements, exclusivity, and promo details.
        </p>
      </div>

      <SignupOffersBrowser offers={offers} />
    </main>
  );
}