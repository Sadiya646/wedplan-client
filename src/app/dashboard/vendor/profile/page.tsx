"use client";

import { useSession } from "@/lib/auth-client";

export default function VendorProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        businessName?: string | null;
        image?: string | null;
      }
    | undefined;

  return (
    <div className="rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-8">
      <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
        Vendor Studio Profile
      </h1>
      <p className="mt-1.5 text-sm text-[#6B5E62]">
        Your studio details visible to couples on WedPlan.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#E6DCD2] pt-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#EFE7DE] bg-[#FAF7F2] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E62]">
            ACCOUNT NAME
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1F1A1D]">
            {user?.name || "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EFE7DE] bg-[#FAF7F2] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E62]">
            STUDIO / BUSINESS NAME
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1F1A1D]">
            {user?.businessName || "Not set yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#EFE7DE] bg-[#FAF7F2] p-4 sm:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E62]">
            EMAIL ADDRESS
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1F1A1D]">
            {user?.email || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}