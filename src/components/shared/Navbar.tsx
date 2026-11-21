"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
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
        className="flex items-center gap-2.5 rounded-full border border-[#E6DCD2] bg-white py-1 pl-1.5 pr-3.5 transition hover:border-[#C59B47] focus:outline-none"
      >
        <span className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-[#C59B47]/40">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback className="bg-[#5E1929] text-xs font-medium text-[#FAF7F2]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[120px] truncate text-xs font-semibold text-[#1F1A1D]">
              {user.name || "Member"}
            </span>
            <span className="mt-0.5 inline-block rounded-full bg-[#F2E2E4] px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#5E1929]">
              {role}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[#6B5E62]" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-50 w-56 border-[#E6DCD2] bg-[#FAF7F2] text-[#1F1A1D] shadow-lg"
      >
        <div className="px-2.5 py-2">
          <p className="text-sm font-semibold leading-none text-[#1F1A1D]">
            {user.name || "Member"}
          </p>
          <p className="mt-1 truncate text-xs text-[#6B5E62]">
            {user.email || ""}
          </p>
          <span className="mt-1.5 inline-block w-fit rounded-full bg-[#F2E2E4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5E1929]">
            {role}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={() => router.push(dashboardRoute)}
          className="cursor-pointer focus:bg-[#F2E2E4]/60"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-[#5E1929]" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(profileSettingsRoute)}
          className="cursor-pointer focus:bg-[#F2E2E4]/60"
        >
          <Settings className="mr-2 h-4 w-4 text-[#5E1929]" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = session?.user as AuthUser | undefined;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/browse-services" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
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
    <header className="sticky top-0 z-50 w-full border-b border-[#E6DCD2] bg-[#FAF7F2]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5E1929] text-[#E5B85C] shadow-xs transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="block font-serif text-xl font-bold leading-none tracking-tight text-[#5E1929]">
              WedPlan
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#C59B47]">
              CURATED WEDDINGS
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "font-semibold text-[#5E1929]"
                  : "text-[#6B5E62] hover:text-[#5E1929]"
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#C59B47]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Side: Dashboard Button + User Dropdown */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-28 rounded-xl bg-[#E6DCD2]" />
              <Skeleton className="h-10 w-36 rounded-full bg-[#E6DCD2]" />
            </div>
          ) : user ? (
            <>
              <Link
                href={dashboardRoute}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E7CFD3] bg-[#F5E6E8] px-4 py-2.5 text-xs font-semibold text-[#5E1929] transition hover:bg-[#EDD6D9]"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <UserDropdown user={user} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#5E1929] transition hover:bg-[#F2E2E4]/60"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[#5E1929] px-6 py-2 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#47111E]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#5E1929] hover:bg-[#F2E2E4]/60 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E6DCD2] bg-[#FAF7F2] px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-base font-medium ${
                  isActive(link.href)
                    ? "bg-[#F2E2E4]/70 text-[#5E1929]"
                    : "text-[#1F1A1D] hover:bg-[#F2E2E4]/40"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="my-2 border-t border-[#E6DCD2]" />

            {isPending ? (
              <Skeleton className="h-10 w-full rounded-lg bg-[#E6DCD2]" />
            ) : user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-semibold text-[#1F1A1D]">
                    {user.name || "Member"}
                  </p>
                  <p className="text-xs text-[#6B5E62]">{user.email || ""}</p>
                </div>
                <Link
                  href={dashboardRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-[#F5E6E8] px-3 py-2 text-sm font-semibold text-[#5E1929]"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={profileSettingsRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#1F1A1D] hover:bg-[#F2E2E4]/50"
                >
                  <Settings className="h-4 w-4 text-[#5E1929]" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full border border-[#5E1929] py-2 text-center text-sm font-medium text-[#5E1929]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full bg-[#5E1929] py-2 text-center text-sm font-medium text-[#FAF7F2] hover:bg-[#47111E]"
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