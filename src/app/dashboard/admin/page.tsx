"use client";

import RoleGuard from "@/components/shared/RoleGuard";
import { useSession } from "@/lib/auth-client";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  return (
    <RoleGuard allowedRole="admin">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <span className="rounded-full bg-[#1F1A1D] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#E5B85C]">
          Admin Control Center
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-[#1F1A1D]">
          Welcome, {session?.user?.name}
        </h1>
        <p className="mt-1 text-sm text-[#6B5E62]">
          Oversee users, approve vendors, moderate services, and track revenue.
        </p>
      </div>
    </RoleGuard>
  );
}