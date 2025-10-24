import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } =await  auth();

    if (!userId) {
      return NextResponse.json({ verified: false, error: "No userId" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ verified: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ verified: user.isVerified });
  } catch (err) {
    console.error("❌ check-verify route error:", err);
    return NextResponse.json({ verified: false, error: "Internal Server Error" }, { status: 500 });
  }
}
