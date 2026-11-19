import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Camera,
  Utensils,
  Flower2,
  Music,
  MapPin,
} from "lucide-react";

const categories = [
  {
    name: "Venues & Estates",
    count: "28+ Curated Spaces",
    icon: MapPin,
  },
  {
    name: "Bridal Photography",
    count: "45+ Studios",
    icon: Camera,
  },
  {
    name: "Gourmet Catering",
    count: "32+ Chefs",
    icon: Utensils,
  },
  {
    name: "Floral & Decor",
    count: "38+ Stylists",
    icon: Flower2,
  },
  {
    name: "Live Music & DJ",
    count: "24+ Artists",
    icon: Music,
  },
];

const featuredServices = [
  {
    id: "1",
    title: "Royal Garden & Banquet Estate",
    vendor: "Atelier Lumiere Studio",
    location: "Dhaka & Sylhet",
    price: "$3,800",
    rating: "4.9",
    category: "Venues & Estates",
  },
  {
    id: "2",
    title: "Editorial Film & Candid Portrait Suite",
    vendor: "Velvet Frame Collective",
    location: "Destination Ready",
    price: "$1,650",
    rating: "5.0",
    category: "Bridal Photography",
  },
  {
    id: "3",
    title: "Five-Course Heritage Wedding Feast",
    vendor: "Maison Velvet Culinary",
    location: "Banquet & Outdoor",
    price: "$2,400",
    rating: "4.8",
    category: "Gourmet Catering",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1F1A1D]">
      {/* Exact Mockup Hero Section */}
      <section className="relative overflow-hidden bg-[#1D1518] text-[#FAF7F2]">
        {/* Background Image from public/images/hero-mockup-bg.jpg */}
        <div
          aria-hidden="true"
          style={{ backgroundImage: "url('/images/hero.jfif')" }}
          className="pointer-events-none absolute inset-0 bg-cover bg-right bg-no-repeat opacity-60 mix-blend-luminosity"
        />

        {/* Left Edge Fade for Crisp Text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1B1316]/90 via-[#1B1316]/45 to-transparent"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-[640px]">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#2C2225]/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D8B467]">
              <Sparkles className="h-3.5 w-3.5 text-[#D8B467]" />
              <span>THE PREMIER WEDDING MARKETPLACE</span>
            </div>

            {/* Main Headline (Playfair Display) */}
            <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-6xl lg:text-[64px]">
              Orchestrate a Celebration{" "}
              <span className="italic font-semibold text-[#E5B85C]">
                Beyond Compare.
              </span>
            </h1>

            {/* Subtitle (Plus Jakarta Sans) */}
            <p className="mt-6 max-w-[580px] text-base leading-[1.65] text-[#D8CFD2] sm:text-[17px]">
              Discover handpicked wedding venues, fine-art photographers, couture
              ateliers, and floral architects. Seamlessly request dates, manage
              bookings, and craft your timeless day.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-[#6B182A] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#541120]"
              >
                <span>Explore Wedding Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/sign-up?role=vendor"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#2A2225]/85 px-6 py-3.5 text-sm font-semibold text-[#EAE3E5] transition hover:border-[#D8B467]/50 hover:bg-[#352B2E]"
              >
                List Your Vendor Studio
              </Link>
            </div>

            {/* Bottom Divider & Gold Stats */}
            <div className="mt-12 max-w-[560px] border-t border-white/10 pt-7">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="font-serif text-2xl font-bold text-[#E5B85C] sm:text-[30px]">
                    450+
                  </p>
                  <p className="mt-1 text-xs text-[#A89B9F]">
                    Vetted Artisans
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl font-bold text-[#E5B85C] sm:text-[30px]">
                    100%
                  </p>
                  <p className="mt-1 text-xs text-[#A89B9F]">
                    Admin Reviewed
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl font-bold text-[#E5B85C] sm:text-[30px]">
                    4.98★
                  </p>
                  <p className="mt-1 text-xs text-[#A89B9F]">
                    Couple Satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B47]">
              CATEGORIES
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[#1F1A1D]">
              Curated Wedding Essentials
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5E1929] hover:underline"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/services?category=${encodeURIComponent(cat.name)}`}
                className="group rounded-2xl border border-[#E6DCD2] bg-white p-5 transition hover:border-[#C59B47] hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2E2E4]/70 text-[#5E1929] transition group-hover:bg-[#5E1929] group-hover:text-[#FAF7F2]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-[#1F1A1D]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-[#6B5E62]">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="border-t border-[#E6DCD2] bg-[#F7F2EA]/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B47]">
                FEATURED PACKAGES
              </p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-[#1F1A1D]">
                Handpicked for Your Big Day
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5E1929] hover:underline"
            >
              <span>Explore All Services</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E6DCD2] bg-white p-6 shadow-2xs transition hover:border-[#C59B47]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-[#F2E2E4] px-3 py-1 font-semibold text-[#5E1929]">
                      {service.category}
                    </span>
                    <span className="font-semibold text-[#1F1A1D]">
                      ★ {service.rating}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-bold text-[#1F1A1D]">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#6B5E62]">
                    By {service.vendor}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-[#6B5E62]">
                    <MapPin className="h-3.5 w-3.5 text-[#C59B47]" />
                    <span>{service.location}</span>
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#E6DCD2] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E62]">
                      Starting At
                    </p>
                    <p className="font-serif text-lg font-bold text-[#5E1929]">
                      {service.price}
                    </p>
                  </div>

                  <Link
                    href="/services"
                    className="rounded-full bg-[#5E1929] px-4 py-2 text-xs font-semibold text-[#FAF7F2] transition hover:bg-[#46111E]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}