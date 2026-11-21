import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const origin =
      (await headers()).get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const body = await req.json();
    const { type } = body;

    if (type === "subscription") {
      const priceId =
        body.priceId || process.env.STRIPE_VENDOR_PREMIUM_PRICE_ID;

      if (!priceId) {
        return NextResponse.json(
          { error: "Stripe subscription Price ID is not configured." },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: body.email || undefined,
        metadata: {
          type: "subscription",
          userEmail: body.email || "",
          plan: "PREMIUM",
        },
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard/vendor/subscription?cancelled=1`,
      });

      return NextResponse.json({ url: session.url });
    }

    // Default: One-time booking payment
    const amountInDollars = Number(body.amount || 0);
    if (!amountInDollars || amountInDollars <= 0) {
      return NextResponse.json(
        { error: "Invalid booking amount." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountInDollars * 100), // smallest currency unit (cents)
            product_data: {
              name: body.serviceTitle || "WedPlan Wedding Booking",
            },
          },
          quantity: 1,
        },
      ],
      customer_email: body.customerEmail || undefined,
      metadata: {
        type: "booking",
        bookingId: body.bookingId || "",
        serviceId: body.serviceId || "",
        serviceTitle: body.serviceTitle || "",
        customerEmail: body.customerEmail || "",
        vendorEmail: body.vendorEmail || "",
        amount: String(amountInDollars),
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/bookings?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}