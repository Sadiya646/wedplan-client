"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarCheck, UserCog } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleGuard from "@/components/shared/RoleGuard";

const customerNav = [
  { name: "Overview", href: "/dashboard/customer", icon: LayoutGrid },
  {
    name: "My Bookings",
    href: "/dashboard/customer/bookings",
    icon: CalendarCheck,
  },
  {
    name: "Profile Settings",
    href: "/dashboard/customer/profile",
    icon: UserCog,
  },
];

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "WP";

  return (
    <RoleGuard allowedRole="customer">
      <div className="min-h-[calc(100vh-80px)] bg-[#FAF7F2] py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:px-8">
          <aside className="w-full shrink-0 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs lg:w-72">
            <div className="flex items-center gap-3.5 border-b border-[#E6DCD2] pb-5">
              <Avatar className="h-12 w-12 border border-[#C59B47]/40">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={user?.name || "Customer"}
                />
                <AvatarFallback className="bg-[#5E1929] text-sm font-semibold text-[#FAF7F2]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-serif text-base font-bold text-[#1F1A1D]">
                  {user?.name || "Customer"}
                </p>
                <span className="mt-1 inline-block rounded-full bg-[#F5E6E8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5E1929]">
                  CUSTOMER PORTAL
                </span>
              </div>
            </div>

            <nav className="mt-5 flex flex-col gap-1.5">
              {customerNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#5E1929] font-semibold text-white shadow-xs"
                        : "text-[#6B5E62] hover:bg-[#F7F1E7] hover:text-[#1F1A1D]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </RoleGuard>
  );
}