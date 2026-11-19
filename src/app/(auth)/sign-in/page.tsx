"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { signIn, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn.email({ email, password });

      if (error) {
        toast.error(error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Fetch updated session to redirect by role
      const sessionRes = await authClient.getSession();
      const user = sessionRes.data?.user as { role?: string; isBlocked?: boolean } | undefined;

      if (user?.isBlocked) {
        await authClient.signOut();
        toast.error("Your account has been blocked by an administrator.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back to WedPlan!");

      if (user?.role === "admin") router.push("/dashboard/admin");
      else if (user?.role === "vendor") router.push("/dashboard/vendor");
      else router.push("/dashboard/customer");

      router.refresh();
    } catch {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E6DCD2] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#5E1929] text-[#C59B47]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#5E1929]">Welcome Back</h1>
          <p className="mt-1 text-sm text-[#6B5E62]">Sign in to manage your wedding plans</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 border-[#E6DCD2]"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 border-[#E6DCD2]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#5E1929] text-[#FAF7F2] hover:bg-[#47111E]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E6DCD2]" />
          <span className="text-xs uppercase text-[#6B5E62]">or</span>
          <div className="h-px flex-1 bg-[#E6DCD2]" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full rounded-full border-[#E6DCD2] text-[#1F1A1D] hover:bg-[#FAF7F2]"
        >
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-[#6B5E62]">
          New to WedPlan?{" "}
          <Link href="/sign-up" className="font-semibold text-[#5E1929] hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}