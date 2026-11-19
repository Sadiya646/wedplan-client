"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  allowedRole: "customer" | "vendor" | "admin";
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user as { role?: string } | undefined;
  const userRole = user?.role || "customer";

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (userRole !== allowedRole) {
      router.replace(`/dashboard/${userRole}`);
    }
  }, [isPending, user, userRole, allowedRole, router]);

  if (isPending || !user || userRole !== allowedRole) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5E1929]" />
      </div>
    );
  }

  return <>{children}</>;
}