"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 bg-[#FAF7F2] text-[#5E1929]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5E62]">
          Verifying session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}