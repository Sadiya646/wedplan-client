"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sparkles, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import UserDropdown from "./UserDropdown";
import { toast } from "sonner";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
      }
    | undefined;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Services", href: "/services" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getDashboardRoute = () => {
    if (user?.role === "admin") return "/dashboard/admin";
    if (user?.role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  const getProfileSettingsRoute = () => {
    if (user?.role === "vendor") return "/dashboard/vendor/profile";
    if (user?.role === "admin") return "/dashboard/admin";
    return "/dashboard/customer/profile";
  };

  const handleMobileLogout = async () => {
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
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E6DCD2] bg-[#FAF7F2]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5E1929] text-[#C59B47] shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#5E1929]">
            Wed<span className="text-[#C59B47]">Plan</span>
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#5E1929] font-semibold"
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

        <div className="hidden md:flex md:items-center md:gap-3">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-full bg-[#E6DCD2]" />
              <Skeleton className="h-9 w-24 rounded-full bg-[#E6DCD2]" />
            </div>
          ) : user ? (
            <UserDropdown user={user} />
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
                    {user.name}
                  </p>
                  <p className="text-xs text-[#6B5E62]">{user.email}</p>
                </div>
                <Link
                  href={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#1F1A1D] hover:bg-[#F2E2E4]/50"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#5E1929]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={getProfileSettingsRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#1F1A1D] hover:bg-[#F2E2E4]/50"
                >
                  <Settings className="h-4 w-4 text-[#5E1929]" />
                  <span>Profile Settings</span>
                </Link>
                <button
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