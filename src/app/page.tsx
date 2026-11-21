"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  ArrowRight,
  Camera,
  Utensils,
  Flower2,
  Music,
  Building2,
} from "lucide-react";

interface FeaturedService {
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
  { name: "Venues & Estates", icon: Building2 },
  { name: "Bridal Photography", icon: Camera },
  { name: "Gourmet Catering", icon: Utensils },
  { name: "Floral & Decor", icon: Flower2 },
  { name: "Live Music & DJ", icon: Music },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HomePage() {
  const [services, setServices] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadFeaturedServices() {
      try {
        const res = await fetch(`${API_BASE}/api/services`);
        if (!res.ok) {
          if (active) setServices([]);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.services || [];
        if (active) {
          setServices(list.slice(0, 3));
        }
      } catch {
        if (active) setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeaturedServices();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1F1A1D]">
      {/* Hero Section with /images/hero.jfif Background */}
      <section className="relative overflow-hidden border-b border-[#E6DCD2] bg-[#1A0D11] text-[#FAF7F2]">
        {/* Background Image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero.jfif')" }}
        />

        {/* Deep Burgundy & Espresso Gradient Overlay matching mockup */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#1A0D11]/95 via-[#251117]/88 to-[#3B1721]/65"
        />

        {/* Hero Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Orchestrate a Celebration{" "}
              <span className="block italic font-semibold text-[#D6B15C]">
                Beyond Compare.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#E3D9DC] sm:text-base">
              Discover handpicked wedding venues, fine-art photographers,
              couture ateliers, and floral architects. Seamlessly request dates,
              manage bookings, and craft your timeless day.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl border border-[#8E3548]/60 bg-[#5E1929] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#491220]"
              >
                <span>Explore Wedding Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#120B0D]/80 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:border-[#D6B15C]/60 hover:bg-[#1E1216]"
              >
                List Your Vendor Studio
              </Link>
            </div>

            {/* Divider & Stats Row matching mockup */}
            <div className="mt-10 border-t border-[#D6B15C]/40 pt-7">
              <div className="grid grid-cols-3 gap-6 sm:max-w-lg">
                <div>
                  <p className="font-serif text-2xl font-bold text-[#D6B15C] sm:text-3xl">
                    450+
                  </p>
                  <p className="mt-0.5 text-xs text-[#E3D9DC]">
                    Vetted Artisans
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl font-bold text-[#D6B15C] sm:text-3xl">
                    100%
                  </p>
                  <p className="mt-0.5 text-xs text-[#E3D9DC]">
                    Admin Reviewed
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl font-bold text-[#D6B15C] sm:text-3xl">
                    4.98★
                  </p>
                  <p className="mt-0.5 text-xs text-[#E3D9DC]">
                    Couple Satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Quick-Filter Bar */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#170D10]/70 px-4 py-3.5 text-xs font-semibold text-[#F5EFEA] backdrop-blur-xs transition hover:border-[#D6B15C]/60 hover:bg-[#241318]/85"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#D6B15C]" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Featured Wedding Services */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B47]">
              CURATED PACKAGES
            </p>
            <h2 className="mt-1.5 font-serif text-3xl font-bold text-[#1F1A1D] sm:text-4xl">
              Featured Wedding Services
            </h2>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E1929] hover:underline"
          >
            <span>Explore All Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-2xl border border-[#E6DCD2] bg-white p-6"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E6DCD2] bg-white p-10 text-center">
            <p className="font-serif text-xl font-bold text-[#1F1A1D]">
              No wedding packages listed yet
            </p>
            <p className="mt-1 text-xs text-[#6B5E62]">
              Vendors can publish packages from the Vendor Portal to feature them
              here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E6DCD2] bg-white shadow-2xs transition hover:border-[#C59B47]"
              >
                <div>
                  {service.image && (
                    <div className="h-48 w-full overflow-hidden bg-[#F7F1E7]">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

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

                    <h3 className="mt-4 font-serif text-xl font-bold text-[#1F1A1D]">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-[#6B5E62]">
                      By {service.vendorName || "Verified Studio"}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[#6B5E62]">
                      <MapPin className="h-3.5 w-3.5 text-[#C59B47]" />
                      <span>{service.location}</span>
                    </p>
                  </div>
                </div>

                <div className="m-6 mt-6 flex items-center justify-between border-t border-[#E6DCD2] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E62]">
                      Starting At
                    </p>
                    <p className="font-serif text-lg font-bold text-[#5E1929]">
                      ${Number(service.price || 0).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
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