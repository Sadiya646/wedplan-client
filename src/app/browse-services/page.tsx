"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface WeddingService {
  _id: string;
  title: string;
  vendorName?: string;
  category: string;
  location: string;
  price: number;
  rating?: number;
  summary?: string;
  image?: string;
}

const CATEGORIES = [
  "All",
  "Venues & Estates",
  "Bridal Photography",
  "Gourmet Catering",
  "Floral & Decor",
  "Live Music & DJ",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function BrowseServicesContent() {
  const {data:session}=useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES.includes(initialCategory) ? initialCategory : "All"
  );
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  const [services, setServices] = useState<WeddingService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync category if URL ?category= changes (e.g., from Home page pills)
  useEffect(() => {
    const paramCat = searchParams.get("category") || "All";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(CATEGORIES.includes(paramCat) ? paramCat : "All");
  }, [searchParams]);

  // Fetch filtered & sorted services from Express backend
  useEffect(() => {
    let active = true;

    async function fetchServices() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }
        if (appliedSearch.trim()) {
          params.set("search", appliedSearch.trim());
        }
        if (sortBy && sortBy !== "newest") {
          params.set("sort", sortBy);
        }

        const queryString = params.toString();
        const url = `${API_BASE}/api/services${queryString ? `?${queryString}` : ""}`;

        const res = await fetch(url);
        if (!res.ok) {
          if (active) setServices([]);
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.services || [];
        if (active) {
          setServices(list);
        }
      } catch {
        if (active) setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      active = false;
    };
  }, [selectedCategory, appliedSearch, sortBy]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const qs = params.toString();
    router.replace(qs ? `/browse-services?${qs}` : "/browse-services", {
      scroll: false,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchInput("");
    setAppliedSearch("");
    setSortBy("newest");
    router.replace("/browse-services", { scroll: false });
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1F1A1D]">
      {/* Page Header */}
      <section className="border-b border-[#E6DCD2] bg-[#1A0D11] py-14 text-[#FAF7F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>VERIFIED WEDDING DIRECTORY</span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">
            Browse Wedding{" "}
            <span className="italic font-semibold text-[#D6B15C]">
              Packages & Studios
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#E3D9DC] sm:text-base">
            Filter by category, search locations or studios, and compare
            transparent pricing before sending your booking request.
          </p>

          {/* Search & Sort Controls */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 flex flex-col gap-3 md:flex-row md:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9A8A8E]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by package title, studio name, or Dhaka area..."
                className="w-full rounded-xl border border-white/15 bg-white py-3.5 pr-4 pl-11 text-sm text-[#1F1A1D] placeholder:text-[#7D6F73] focus:border-[#D6B15C] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#241318] px-3.5 py-2.5">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#D6B15C]" />
              <select
                aria-label="Sort services"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none"
              >
                <option value="newest" className="bg-[#1A0D11] text-white">
                  Newest First
                </option>
                <option value="price-asc" className="bg-[#1A0D11] text-white">
                  Price: Low to High
                </option>
                <option value="rating-desc" className="bg-[#1A0D11] text-white">
                  Top Rated
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#C89D3C] px-6 py-3.5 text-sm font-semibold text-[#1F1A1D] transition hover:bg-[#B88D2F]"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#5E1929] text-white ring-1 ring-[#D6B15C]/60"
                      : "border border-white/10 bg-white/[0.05] text-[#F5EFEA] hover:border-[#D6B15C]/50 hover:bg-white/[0.1]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B5E62]">
          <p>
            Showing{" "}
            <span className="font-bold text-[#1F1A1D]">{services.length}</span>{" "}
            {services.length === 1 ? "package" : "packages"}
            {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            {appliedSearch ? ` for "${appliedSearch}"` : ""}
          </p>

          {(selectedCategory !== "All" ||
            appliedSearch ||
            sortBy !== "newest") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 font-semibold text-[#5E1929] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-88 animate-pulse rounded-2xl border border-[#E6DCD2] bg-white p-6"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#E6DCD2] bg-white p-12 text-center">
            <p className="font-serif text-2xl font-bold text-[#1F1A1D]">
              No matching wedding packages found
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#6B5E62]">
              Try clearing your search keyword or switching to another category
              to explore more wedding studios.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5E1929] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#46111E]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E6DCD2] bg-white shadow-2xs transition hover:border-[#C59B47]"
              >
                <div>
                  <div className="h-52 w-full overflow-hidden bg-[#F3ECE2]">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#251117] text-xs font-semibold tracking-wider text-[#E5B85C] uppercase">
                        WedPlan Curated Studio
                      </div>
                    )}
                  </div>

                  <div className="p-6 pb-0">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="rounded-full bg-[#F2E2E4] px-3 py-1 font-semibold text-[#5E1929]">
                        {service.category}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1F1A1D]">
                        <Star className="h-3.5 w-3.5 fill-[#C59B47] text-[#C59B47]" />
                        {(service.rating ?? 5.0).toFixed(1)}
                      </span>
                    </div>

                    <h2 className="mt-3.5 font-serif text-xl font-bold text-[#1F1A1D]">
                      {service.title}
                    </h2>

                    <p className="mt-1 text-xs font-medium text-[#6B5E62]">
                      By {service.vendorName || "Verified Studio"}
                    </p>

                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#6B5E62]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C59B47]" />
                      <span>{service.location}</span>
                    </p>

                    {service.summary && (
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#574B4F]">
                        {service.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="m-6 mt-6 flex items-center justify-between border-t border-[#E6DCD2] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E62]">
                      Package Price
                    </p>
                    <p className="font-serif text-lg font-bold text-[#5E1929]">
                      ৳{Number(service.price || 0).toLocaleString()}
                    </p>
                  </div>

                 <Link
  href={session?.user ? `/services/${service._id}` : "/sign-up"}
  className="rounded-full bg-[#5E1929] px-4 py-2 text-xs font-semibold text-[#FAF7F2] transition hover:bg-[#46111E]"
>
  View Details
</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] p-10 text-center text-sm text-[#6B5E62]">
          Loading wedding services...
        </div>
      }
    >
      <BrowseServicesContent />
    </Suspense>
  );
}