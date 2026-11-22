import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { stripe } from "@/lib/stripe";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function createServerJwt(payload: Record<string, unknown>) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 min expiry
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

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
      const token = createServerJwt({
        email: meta.userEmail,
        role: "vendor",
        source: "stripe-webhook",
      });

      await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: meta.userEmail,
          subscriptionPlan: "PREMIUM",
          stripeTransactionId: transactionId,
        }),
      }).catch(() => {});
    }

    if (meta.type === "booking" && meta.bookingId) {
      const token = createServerJwt({
        email: meta.customerEmail || meta.userEmail || "webhook@wedplan.app",
        role: "customer",
        source: "stripe-webhook",
      });

      await fetch(`${API_BASE}/api/bookings/${meta.bookingId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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