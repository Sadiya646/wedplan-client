import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "JWT_SECRET is not configured" },
        { status: 500 }
      );
    }

    const user = session.user as {
      id: string;
      email: string;
      role?: string;
    };

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "customer",
      },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("GET /api/auth/token error:", error);
    return NextResponse.json(
      { message: "Failed to generate token" },
      { status: 500 }
    );
  }
}