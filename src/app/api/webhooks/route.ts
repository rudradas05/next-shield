import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.type;
    const clerkUser = payload.data || payload.object; // Handle both cases safely

    if (!clerkUser) {
      return NextResponse.json({ success: false, message: "Invalid Clerk payload" }, { status: 400 });
    }

    // Create user when Clerk sends "user.created"
    if (eventType === "user.created") {
      await db.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.email_addresses?.[0]?.email_address || "",
          fName: clerkUser.first_name || "",
          lName: clerkUser.last_name || "",
          phoneNo: clerkUser.phone_numbers?.[0]?.phone_number || "",
          isVerified:
            clerkUser.email_addresses?.[0]?.verification?.status === "verified" || false,
        },
      });
    }

    // Update verification status if verified later
    if (eventType === "user.updated" || eventType === "user.verified") {
      await db.user.update({
        where: { clerkId: clerkUser.id },
        data: {
          isVerified:
            clerkUser.email_addresses?.[0]?.verification?.status === "verified" || false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Clerk Webhook Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
