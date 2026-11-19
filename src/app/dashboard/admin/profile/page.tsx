"use client";

import RoleGuard from "@/components/shared/RoleGuard";
import { useSession } from "@/lib/auth-client";

export default function AdminProfilePage() {
  const { data: session } = useSession();

  return (
    <RoleGuard allowedRole="admin">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
          Admin Profile Settings
        </h1>
        <p className="mt-2 text-sm text-[#6B5E62]">
          {session?.user?.name} — {session?.user?.email}
        </p>
      </div>
    </RoleGuard>
  );
}