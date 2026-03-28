import { getAllMerchantOffers } from "@/lib/data";
import { MerchantOffersBrowser } from "@/components/merchant-offers-browser";

export default async function MerchantOffersPage() {
  const offers = await getAllMerchantOffers();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Merchant Offers</h1>
        <p className="mt-2 max-w-3xl text-white/60">
          Compare merchant cashback offers across categories and sort through the
          highest-value opportunities in the database.
        </p>
      </div>

      <MerchantOffersBrowser offers={offers} />
    </main>
  );
}