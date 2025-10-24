import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isVerified: false, error: "Unauthorized: Missing Clerk userId" },
        { status: 401 }
      );
    }

    // Fetch user from Prisma database using Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { isVerified: true },
    });

    if (!user) {
      // User not yet created in DB (webhook delay)
      return NextResponse.json(
        { isVerified: false, error: "User not synced yet. Try again in a moment." },
        { status: 404 }
      );
    }

    // Return verification status
    return NextResponse.json({ isVerified: user.isVerified });
  } catch (error) {
    console.error("❌ /api/check-verify route error:", error);
    return NextResponse.json(
      { isVerified: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
