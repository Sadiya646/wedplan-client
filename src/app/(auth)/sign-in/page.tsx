"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

type Role = "customer" | "vendor" | "admin";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getDashboardPath(role?: string) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "vendor") return "/dashboard/vendor";
  return "/dashboard/customer";
}

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUserRoleFromDB = async (userEmail: string): Promise<Role> => {
    try {
      const res = await fetch(
        `${API_BASE}/api/users/role?email=${encodeURIComponent(
          userEmail.trim()
        )}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        if (
          data?.role === "admin" ||
          data?.role === "vendor" ||
          data?.role === "customer"
        ) {
          return data.role;
        }
      }
    } catch {
      // Fallback below
    }
    return "customer";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn.email({
        email: cleanEmail,
        password,
      });

      if (res.error) {
        toast.error(res.error.message || "Invalid email or password");
        return;
      }

      const signedInUser = res.data?.user as
        | { email?: string; role?: string; isBlocked?: boolean }
        | undefined;

      if (signedInUser?.isBlocked) {
        toast.error("Your account has been blocked by an administrator.");
        return;
      }

      const validSessionRole =
        signedInUser?.role === "admin" ||
        signedInUser?.role === "vendor" ||
        signedInUser?.role === "customer"
          ? signedInUser.role
          : null;

      const finalRole =
        validSessionRole ||
        (await fetchUserRoleFromDB(signedInUser?.email || cleanEmail));

        //record login activity in mongodb user collection

       await fetch(`${API_BASE}/api/users/login-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: signedInUser?.email || cleanEmail }),
      }).catch(() => null);
      

      toast.success("Welcome back to WedPlan!");
      router.push(getDashboardPath(finalRole));
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      toast.error(
        err instanceof Error ? err.message : "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });
    } catch {
      toast.error("Google sign in failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1F1A1D]/55 px-4 py-8 backdrop-blur-sm">
      <div className="relative my-auto w-full max-w-[440px] rounded-[28px] border border-[#E6DCD2] bg-[#FAF7F2] px-8 py-9 shadow-2xl">
        {/* Top-right Close Button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#E6DCD2] bg-[#F5EFE6] text-[#6B5E62] transition hover:border-[#C59B47] hover:text-[#1F1A1D]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B47]">
            BETTER AUTH SECURITY
          </p>
          <h1 className="mt-1 font-serif text-[32px] font-bold leading-tight text-[#1F1A1D]">
            Welcome Back to WedPlan
          </h1>
          <p className="mt-2 text-xs text-[#6B5E62]">
            Sign in with your registered account to access your dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#F7F1E7] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#9E9397] focus:border-[#5E1929] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#F7F1E7] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#9E9397] focus:border-[#5E1929] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5E1929] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46111E] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? "Signing In..." : "Sign In with Email"}</span>
          </button>
        </form>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E2D6C8] bg-white py-3 text-sm font-semibold text-[#1F1A1D] transition hover:border-[#C59B47] hover:bg-[#FCFBF9] disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.02v3.14C3.05 21.2 7.24 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.03 14.04c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.18H1.02C.37 7.47 0 8.91 0 10.45s.37 2.98 1.02 4.27l4.01-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.79 0 3.41.62 4.68 1.82l3.51-3.51C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.8 1.02 6.82l4.01 3.14c.98-2.94 3.73-5.21 6.97-5.21Z"
            />
          </svg>
          <span>Continue with Google OAuth</span>
        </button>

        {/* Create Account Link */}
        <p className="mt-6 text-center text-xs text-[#6B5E62]">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#5E1929] hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}