import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};
    const transactionId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || session.id;

    if (meta.type === "subscription" && meta.userEmail) {
      await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: meta.userEmail,
          subscriptionPlan: "PREMIUM",
          stripeTransactionId: transactionId,
        }),
      }).catch(() => {});
    }

    if (meta.type === "booking" && meta.bookingId) {
      await fetch(`${API_BASE}/api/bookings/${meta.bookingId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "PAID",
          transactionId,
          amountPaid: session.amount_total ? session.amount_total / 100 : 0,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}