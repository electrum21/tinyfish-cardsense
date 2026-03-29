"use client";

import { useMemo, useState } from "react";
import type { MerchantOffer } from "@/lib/data";

type Props = {
  offers: MerchantOffer[];
};

type MerchantSortKey = "highest_cashback" | "merchant" | "category";

export function MerchantOffersBrowser({ offers }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<MerchantSortKey>("highest_cashback");

  const categories = useMemo(() => {
    return Array.from(new Set(offers.map((offer) => offer.category).filter(Boolean) as string[])).sort();
  }, [offers]);

  const filteredOffers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = offers.filter((offer) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (offer.merchant ?? "").toLowerCase().includes(normalizedSearch) ||
        (offer.category ?? "").toLowerCase().includes(normalizedSearch) ||
        (offer.cashback_rate ?? "").toLowerCase().includes(normalizedSearch);

      const matchesCategory = category === "all" || offer.category === category;

      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === "merchant") {
        return (a.merchant ?? "").localeCompare(b.merchant ?? "");
      }

      if (sortBy === "category") {
        return (a.category ?? "").localeCompare(b.category ?? "");
      }

      return Number(b.cashback_rate_number ?? 0) - Number(a.cashback_rate_number ?? 0);
    });

    return result;
  }, [category, offers, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <label className="mb-2 block text-sm text-white/60">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant, category, cashback..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="xl:col-span-3">
            <SelectField
              label="Category"
              value={category}
              onChange={setCategory}
              options={[
                { value: "all", label: "All categories" },
                ...categories.map((value) => ({ value, label: value }))
              ]}
            />
          </div>

          <div className="xl:col-span-2">
            <SelectField
              label="Sort by"
              value={sortBy}
              onChange={(value) => setSortBy(value as MerchantSortKey)}
              options={[
                { value: "highest_cashback", label: "Highest cashback" },
                { value: "merchant", label: "Merchant" },
                { value: "category", label: "Category" }
              ]}
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-white/55">
          Showing <span className="font-semibold text-white">{filteredOffers.length}</span> offers
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredOffers.map((offer) => (
          <div key={offer.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{offer.merchant ?? "--"}</h2>
                <div className="mt-1 text-sm text-white/60">{offer.category ?? "--"}</div>
              </div>

              <div className="rounded-2xl bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-200">
                {offer.cashback_rate ?? "--"}
              </div>
            </div>

            <div className="grid gap-4">
              <InfoItem label="Category" value={offer.category ?? "--"} />
              <InfoItem
                label="Numeric Rate"
                value={
                  offer.cashback_rate_number !== null && offer.cashback_rate_number !== undefined
                    ? `${offer.cashback_rate_number}%`
                    : "--"
                }
              />
              <InfoItem label="Source" value={offer.source ?? "--"} />
            </div>
          </div>
        ))}

        {filteredOffers.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 p-8 text-white/50">
            No merchant offers matched your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm text-white/60">{label}</label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 pr-10 text-white outline-none focus:border-cyan-400"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/50">
          ▼
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-2 text-sm text-white/85">{value}</div>
    </div>
  );
}