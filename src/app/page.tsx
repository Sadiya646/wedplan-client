"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Camera,
  Utensils,
  Flower2,
  Building2,
  Crown,
  ShieldCheck,
  CalendarCheck,
  Gem,
  Lock,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

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

const WEDDING_CATEGORIES = [
  {
    countLabel: "42 ARTISANS",
    title: "Photography & Videography",
    filterValue: "Bridal Photography",
    description: "Fine-art film photography & cinematic wedding reels",
    icon: Camera,
  },
  {
    countLabel: "28 ESTATES",
    title: "Wedding Venues",
    filterValue: "Venues & Estates",
    description: "Historic châteaux, botanical conservatories & ballrooms",
    icon: Building2,
  },
  {
    countLabel: "35 STUDIOS",
    title: "Decoration & Florist",
    filterValue: "Floral & Decor",
    description: "Sculptural floral installations & bespoke tablescapes",
    icon: Flower2,
  },
  {
    countLabel: "24 CULINARY",
    title: "Catering Services",
    filterValue: "Gourmet Catering",
    description: "Michelin-inspired multi-course tasting menus & patisserie",
    icon: Utensils,
  },
  {
    countLabel: "31 STYLISTS",
    title: "Makeup & Styling",
    filterValue: "Makeup & Styling",
    description: "Editorial bridal hair, luminous makeup & day-of styling",
    icon: Sparkles,
  },
  {
    countLabel: "19 ATELIERS",
    title: "Wedding Fashion",
    filterValue: "Wedding Fashion",
    description: "Custom couture gowns, bespoke tuxedos & heirloom veils",
    icon: Crown,
  },
];

const WHY_WEDPLAN_FEATURES = [
  {
    title: "Admin-Vetted Vendors",
    description:
      "Every published service undergoes manual quality verification before appearing on the marketplace.",
    icon: ShieldCheck,
  },
  {
    title: "Conflict-Free Booking",
    description:
      "Automated duplicate-date protection ensures seamless availability requests and transparent status tracking.",
    icon: CalendarCheck,
  },
  {
    title: "Premium Artisan Badges",
    description:
      "Identify top-tier vendors backed by verified subscriptions and proven portfolio excellence.",
    icon: Gem,
  },
  {
    title: "Role-Secured Dashboards",
    description:
      "Dedicated workspaces for Couples, Vendors, and Administrators with strict session & RBAC protection.",
    icon: Lock,
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Discover & Filter Artisans",
    description:
      "Browse curated venues, photographers, and florists by location, category, and transparent pricing.",
  },
  {
    step: "02",
    title: "Submit Date & Venue Requests",
    description:
      "Sign in as a Couple to send tailored booking inquiries with your wedding date and celebration details.",
  },
  {
    step: "03",
    title: "Track Approvals in Real Time",
    description:
      "Vendors review and accept requests directly from their dashboard while you track every milestone.",
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

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

  // Redirect to /sign-in if guest clicks protected items (categories, services, details)
  const handleProtectedNavigate = (
    e: React.MouseEvent,
    destination: string
  ) => {
    if (!session?.user) {
      e.preventDefault();
      toast.info("Please sign in or sign up to explore categories and services.");
      router.push("/sign-in");
    } else {
      router.push(destination);
    }
  };

  return (
    <main className="min-h-screen scroll-smooth bg-[#FAF7F2] text-[#1F1A1D]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E6DCD2] bg-[#1A0D11] text-[#FAF7F2]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero.jfif')" }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#1A0D11]/95 via-[#251117]/88 to-[#3B1721]/65"
        />

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

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/browse-services"
                onClick={(e) => handleProtectedNavigate(e, "/browse-services")}
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
        </div>
      </section>

      {/* Explore by Wedding Category (Navbar "Categories" scrolls here) */}
      <section
        id="categories"
        className="scroll-mt-24 border-b border-[#ECE2D6] bg-[#FAF7F2] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88D2F]">
                CURATED SPECIALTIES
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#251319] sm:text-4xl">
                Explore by Wedding Category
              </h2>
            </div>

            <Link
              href="/browse-services"
              onClick={(e) => handleProtectedNavigate(e, "/browse-services")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E1929] transition hover:text-[#3D0F1A]"
            >
              <span>View All Categories</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WEDDING_CATEGORIES.map((item) => {
              const Icon = item.icon;
              const targetUrl = `/browse-services?category=${encodeURIComponent(item.filterValue)}`;
              return (
                <Link
                  key={item.title}
                  href={targetUrl}
                  onClick={(e) => handleProtectedNavigate(e, targetUrl)}
                  className="group flex items-start gap-4 rounded-2xl border border-[#ECE2D6] bg-white p-6 shadow-[0_2px_10px_rgba(31,26,29,0.02)] transition duration-200 hover:border-[#C59B47] hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E7EA] text-[#5E1929] transition-colors duration-200 group-hover:bg-[#5E1929] group-hover:text-[#FAF7F2]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B88D2F]">
                        {item.countLabel}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#5E1929] transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>

                    <h3 className="mt-1 font-serif text-lg font-bold text-[#251319] transition-colors group-hover:text-[#5E1929]">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-[#6B5E62]">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Wedding Services */}
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
            href="/browse-services"
            onClick={(e) => handleProtectedNavigate(e, "/browse-services")}
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
            {services.map((service) => {
              const detailUrl = `/services/${service._id}`;
              return (
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
                        ৳{Number(service.price || 0).toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={detailUrl}
                      onClick={(e) => handleProtectedNavigate(e, detailUrl)}
                      className="rounded-full bg-[#5E1929] px-4 py-2 text-xs font-semibold text-[#FAF7F2] transition hover:bg-[#46111E]"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Discerning Couples Choose WedPlan */}
      <section className="border-t border-[#ECE2D6] bg-[#FAF7F2] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88D2F]">
              THE WEDPLAN STANDARD
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#251319] sm:text-5xl">
              Why Discerning Couples Choose WedPlan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B5E62]">
              Engineered for transparency, security, and effortless
              collaboration between couples and premier wedding vendors.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_WEDPLAN_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#ECE2D6] bg-white p-7 shadow-[0_2px_12px_rgba(31,26,29,0.02)] transition hover:border-[#C59B47]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5E1929] text-[#E5B85C]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-6 font-serif text-xl font-bold text-[#251319]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-[#6B5E62]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How WedPlan Works (Navbar "How It Works" scrolls here) */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-[#1C1618] py-16 text-[#FAF7F2] sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B47]">
              EFFORTLESS JOURNEY
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl">
              How WedPlan Works
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#C9BFC2]">
              From initial inspiration to confirmed wedding day bookings in three
              refined steps.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[#3A2E2B] bg-[#241D1F] p-8 transition hover:border-[#C59B47]/60"
              >
                <p className="font-serif text-3xl font-semibold text-[#8A6D3B]">
                  {item.step}
                </p>
                <h3 className="mt-4 font-serif text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-[#B8AEB1]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2E2226] bg-[#140B0E] text-[#E3D9DC]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5E1929] text-[#E5B85C]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-serif text-xl font-bold text-white">
                  WedPlan
                </span>
              </Link>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#A89B9F]">
                Curated wedding venues, photography studios, and celebration
                artisans across Dhaka and beyond.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-xs font-medium">
              <Link href="/" className="transition hover:text-[#D6B15C]">
                Home
              </Link>
              <Link
                href="/browse-services"
                onClick={(e) => handleProtectedNavigate(e, "/browse-services")}
                className="transition hover:text-[#D6B15C]"
              >
                Browse Services
              </Link>
              <Link
                href="/#categories"
                className="transition hover:text-[#D6B15C]"
              >
                Categories
              </Link>
              <Link
                href="/#how-it-works"
                className="transition hover:text-[#D6B15C]"
              >
                How It Works
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-[11px] text-[#8E8185] sm:flex-row">
            <p>© 2026 WedPlan. All rights reserved.</p>
            <p>Crafted for timeless celebrations.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}