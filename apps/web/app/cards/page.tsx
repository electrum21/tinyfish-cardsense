import { getAllCards } from "@/lib/data";
import { CardsBrowser } from "@/components/cards-browser";

export default async function CardsPage() {
  const cards = await getAllCards();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Cards</h1>
        <p className="mt-2 max-w-3xl text-white/60">
          Browse all cards in the CardSense database and filter by bank, card type,
          annual fee, and reward profile.
        </p>
      </div>

      <CardsBrowser cards={cards} />
    </main>
  );
}