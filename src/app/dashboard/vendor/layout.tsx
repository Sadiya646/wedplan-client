"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  PlusCircle,
  Inbox,
  Crown,
  UserCog,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleGuard from "@/components/shared/RoleGuard";

const vendorNav = [
  { name: "Overview", href: "/dashboard/vendor", icon: LayoutGrid },
  {
    name: "My Services",
    href: "/dashboard/vendor/services",
    icon: Sparkles,
  },
  {
    name: "Add Service",
    href: "/dashboard/vendor/services?new=1",
    icon: PlusCircle,
  },
  {
    name: "Booking Requests",
    href: "/dashboard/vendor/bookings",
    icon: Inbox,
  },
  {
    name: "Subscription Plan",
    href: "/dashboard/vendor/subscription",
    icon: Crown,
  },
  {
    name: "Profile Settings",
    href: "/dashboard/vendor/profile",
    icon: UserCog,
  },
];

function VendorDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNewServiceMode = searchParams.get("new") === "1";

  const { data: session } = useSession();
  const user = session?.user as
    | {
        name?: string | null;
        image?: string | null;
        businessName?: string | null;
      }
    | undefined;

  const displayName = user?.name || "Julian Mercer";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isNavItemActive = (href: string) => {
    if (href === "/dashboard/vendor") {
      return pathname === "/dashboard/vendor";
    }
    if (href === "/dashboard/vendor/services") {
      return pathname === "/dashboard/vendor/services" && !isNewServiceMode;
    }
    if (href === "/dashboard/vendor/services?new=1") {
      return pathname === "/dashboard/vendor/services" && isNewServiceMode;
    }
    return pathname === href;
  };

  return (
    <RoleGuard allowedRole="vendor">
      <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:px-8">
          {/* Left Floating Sidebar Card */}
          <aside className="w-full shrink-0 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs lg:w-72">
            <div className="flex items-center gap-3.5 border-b border-[#EFE7DE] pb-5">
              <Avatar className="h-12 w-12 border border-[#E6DCD2]">
                <AvatarImage src={user?.image || undefined} alt={displayName} />
                <AvatarFallback className="bg-[#5E1929] text-sm font-semibold text-[#FAF7F2]">
                  {initials || "JM"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-serif text-base font-bold text-[#1F1A1D]">
                  {displayName}
                </p>
                <span className="mt-1 inline-block rounded-full bg-[#F5E6E8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5E1929]">
                  VENDOR PORTAL
                </span>
              </div>
            </div>

            <nav className="mt-5 flex flex-col gap-1.5">
              {vendorNav.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#531222] font-semibold text-white shadow-xs"
                        : "text-[#6B5E62] hover:bg-[#F7F1E7] hover:text-[#1F1A1D]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-[#E5B85C]" : "text-[#6B5E62]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Right Main Content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </RoleGuard>
  );
}

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] p-10 text-center text-sm text-[#6B5E62]">
          Loading vendor workspace...
        </div>
      }
    >
      <VendorDashboardShell>{children}</VendorDashboardShell>
    </Suspense>
  );
}