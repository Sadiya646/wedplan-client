"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    const user = session?.user as
      | { email?: string | null; role?: string | null }
      | undefined;

    if (!user?.email) {
      router.replace("/sign-in");
      return;
    }

    const redirectByRole = async () => {
      let role = user.role;

      if (!role || !["admin", "vendor", "customer"].includes(role)) {
        try {
          const res = await fetch(
            `${API_BASE}/api/users/role?email=${encodeURIComponent(user.email!)}`,
            { credentials: "include" }
          );
          if (res.ok) {
            const data = await res.json();
            role = data?.role;
          }
        } catch {
          // fallback to customer
        }
      }

      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "vendor") {
        router.replace("/dashboard/vendor");
      } else {
        router.replace("/dashboard/customer");
      }
    };

    redirectByRole();
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#6B5E62]">
      <Loader2 className="h-6 w-6 animate-spin text-[#5E1929]" />
      <p className="text-sm font-medium">Redirecting to your dashboard...</p>
    </div>
  );
}