import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-3xl border border-[#ECE2D6] bg-white p-8 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <XCircle className="h-12 w-12 text-amber-600" />
          <h1 className="font-serif text-2xl font-bold text-[#1F1A1D]">
            Payment Cancelled
          </h1>
          <p className="text-sm text-[#6B5E62]">
            Your Stripe checkout was cancelled. No charges were made and your
            current subscription plan remains unchanged.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/vendor/subscription"
              className="rounded-xl bg-[#1C1214] px-5 py-2.5 text-xs font-bold text-[#D6B15C] transition hover:opacity-95"
            >
              Return to Subscription Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}