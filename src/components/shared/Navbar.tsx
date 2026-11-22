"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  LayoutGrid,
  Crown,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/auth-fetch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AuthUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "customer" | "vendor" | "admin" | string;
}

function UserDropdown({ user }: { user?: AuthUser | null }) {
  const router = useRouter();

  if (!user) return null;

  const role = user.role || "customer";
  const dashboardRoute = `/dashboard/${role}`;
  const profileSettingsRoute = `/dashboard/${role}/profile`;

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            clearAuthToken();
            toast.success("Signed out successfully");
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "WP";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        type="button"
        className="group flex items-center gap-2.5 rounded-full border border-[#E2D3C3] bg-white/95 py-1 pl-1.5 pr-3.5 shadow-[0_2px_10px_rgba(94,25,41,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C59B47] hover:shadow-[0_6px_18px_rgba(197,155,71,0.16)] focus:outline-none"
      >
        <span className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-[#C59B47]/45 transition-all group-hover:ring-[#C59B47]">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-[#6E1E31] to-[#47111E] text-xs font-semibold text-[#FAF7F2]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[120px] truncate text-xs font-semibold text-[#1F1A1D]">
              {user.name || "Member"}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#F5E6E8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#5E1929]">
              <Crown className="h-2.5 w-2.5 text-[#C59B47]" />
              {role}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[#6B5E62] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-50 w-60 rounded-2xl border border-[#E6DCD2] bg-[#FAF7F2] p-1.5 text-[#1F1A1D] shadow-[0_14px_34px_rgba(31,26,29,0.14)]"
      >
        <div className="rounded-xl bg-gradient-to-r from-[#F7EFE4] to-[#F5E6E8]/70 px-3 py-2.5">
          <p className="text-sm font-semibold leading-none text-[#1F1A1D]">
            {user.name || "Member"}
          </p>
          <p className="mt-1 truncate text-xs text-[#6B5E62]">
            {user.email || ""}
          </p>
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-[#E5B85C]/50 bg-[#1F1A1D] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E5B85C]">
            {role}
          </span>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={() => router.push(dashboardRoute)}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-[#F2E2E4]/80 focus:text-[#5E1929]"
        >
          <LayoutDashboard className="mr-2.5 h-4 w-4 text-[#5E1929]" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(profileSettingsRoute)}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-[#F2E2E4]/80 focus:text-[#5E1929]"
        >
          <Settings className="mr-2.5 h-4 w-4 text-[#5E1929]" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-red-700 focus:bg-red-50 focus:text-red-800"
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavbarContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = session?.user as AuthUser | undefined;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/browse-services" },
    { name: "Categories", href: "/#categories" },
    { name: "How It Works", href: "/#how-it-works" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  const role = user?.role || "customer";
  const dashboardRoute = `/dashboard/${role}`;
  const profileSettingsRoute = `/dashboard/${role}/profile`;

  const handleMobileLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            clearAuthToken();
            setMobileMenuOpen(false);
            toast.success("Signed out successfully");
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E6DCD2]/90 bg-[#FAF7F2]/85 shadow-[0_4px_24px_rgba(31,26,29,0.04)] backdrop-blur-xl">
      {/* Subtle luxury gold top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C59B47] to-transparent opacity-75" />

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D1D30] via-[#5E1929] to-[#3F0E1A] text-[#E5B85C] shadow-[0_6px_16px_rgba(94,25,41,0.28)] ring-1 ring-[#E5B85C]/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-[0_10px_22px_rgba(94,25,41,0.36)]">
            <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div>
            <span className="block font-serif text-xl font-bold leading-none tracking-tight text-[#5E1929] transition-colors group-hover:text-[#420F1C]">
              WedPlan
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-[#B88B34]">
              CURATED WEDDINGS
            </span>
          </div>
        </Link>

        {/* Center Navigation Pills */}
        <nav className="hidden items-center gap-1 rounded-full border border-[#EADFD3] bg-white/75 p-1.5 shadow-2xs md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
                  active
                    ? "bg-[#F5E6E8] font-semibold text-[#5E1929] shadow-2xs"
                    : "font-medium text-[#6B5E62] hover:bg-[#FAF5EE] hover:text-[#5E1929]"
                }`}
              >
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C59B47]" />
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {isPending ? (
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-10 w-28 rounded-full bg-[#E6DCD2]" />
              <Skeleton className="h-10 w-36 rounded-full bg-[#E6DCD2]" />
            </div>
          ) : user ? (
            <>
              <Link
                href={dashboardRoute}
                className="inline-flex items-center gap-2 rounded-full border border-[#E3C6CA] bg-[#F7E8EA] px-4 py-2.5 text-xs font-semibold text-[#5E1929] shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C59B47] hover:bg-[#EFE0E2]"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#5E1929]" />
                <span>Dashboard</span>
              </Link>
              <UserDropdown user={user} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-[#5E1929] transition-all hover:border-[#E5D5C5] hover:bg-[#F5E6E8]/60"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-gradient-to-r from-[#6B1C2F] to-[#4A101E] px-6 py-2.5 text-sm font-semibold text-[#FAF7F2] shadow-[0_6px_18px_rgba(94,25,41,0.28)] ring-1 ring-[#E5B85C]/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#5E1929] hover:to-[#3A0B16] hover:shadow-[0_10px_24px_rgba(94,25,41,0.36)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl border border-[#E6DCD2] bg-white/90 p-2.5 text-[#5E1929] shadow-2xs transition hover:border-[#C59B47] hover:bg-[#F5E6E8]/60 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E6DCD2] bg-[#FAF7F2]/98 px-4 pb-6 pt-4 shadow-xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#F5E6E8] font-semibold text-[#5E1929]"
                      : "text-[#1F1A1D] hover:bg-[#F3ECE2]"
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-[#C59B47]" />
                  )}
                </Link>
              );
            })}

            <div className="my-3 border-t border-[#E6DCD2]" />

            {isPending ? (
              <Skeleton className="h-11 w-full rounded-xl bg-[#E6DCD2]" />
            ) : user ? (
              <div className="space-y-2 rounded-2xl border border-[#E6DCD2] bg-white/80 p-3">
                <div className="border-b border-[#EFE7DE] pb-2.5">
                  <p className="text-sm font-semibold text-[#1F1A1D]">
                    {user.name || "Member"}
                  </p>
                  <p className="truncate text-xs text-[#6B5E62]">
                    {user.email || ""}
                  </p>
                </div>
                <Link
                  href={dashboardRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl bg-[#F5E6E8] px-3.5 py-2.5 text-sm font-semibold text-[#5E1929]"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={profileSettingsRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#1F1A1D] transition hover:bg-[#FAF5EE]"
                >
                  <Settings className="h-4 w-4 text-[#5E1929]" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full border border-[#5E1929] bg-white py-2.5 text-center text-sm font-semibold text-[#5E1929] transition hover:bg-[#F5E6E8]/60"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-gradient-to-r from-[#6B1C2F] to-[#4A101E] py-2.5 text-center text-sm font-semibold text-[#FAF7F2] shadow-sm transition hover:from-[#5E1929] hover:to-[#3A0B16]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 h-20 w-full border-b border-[#E6DCD2] bg-[#FAF7F2]/95" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}