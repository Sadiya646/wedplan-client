import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

function getStripeClient() {
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
  }
  return new Stripe(secretKey);
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { paid: false, error: "Missing session_id" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid =
      session.payment_status === "paid" || session.status === "complete";

    return NextResponse.json({
      paid,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail:
        session.customer_details?.email || session.customer_email || "",
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || "usd",
      metadata: session.metadata || {},
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to verify Stripe session";
    return NextResponse.json({ paid: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeClient();
    const body = await req.json();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const priceId = process.env.STRIPE_VENDOR_PREMIUM_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_VENDOR_PREMIUM_PRICE_ID in .env.local" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        type: "subscription",
        email: body.email || "",
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}