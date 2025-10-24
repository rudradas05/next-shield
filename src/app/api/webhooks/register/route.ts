import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db"; // your Prisma client

// Note: Clerk webhooks are signed with Svix. Set CLERK_WEBHOOK_SECRET in env.
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();

  
  const headerList =await  headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn("Missing svix headers:", { svixId, svixTimestamp, svixSignature });
    return new Response("Missing svix headers", { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;
  try {
    
    evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  
  const eventType: string | undefined = evt?.type;
  const data: any = evt?.data;

  if (!eventType || !data) {
    console.error("Malformed webhook event:", evt);
    return new Response("Malformed event", { status: 400 });
  }

 
  const getPrimaryEmail = (userPayload: any): string | null => {
    try {
  
      const emailAddresses: any[] | undefined = userPayload?.email_addresses;
      const primaryId: string | undefined = userPayload?.primary_email_address_id;

      if (Array.isArray(emailAddresses) && emailAddresses.length > 0) {
        if (primaryId) {
          const primary = emailAddresses.find((e) => e.id === primaryId);
          if (primary?.email_address) return primary.email_address;
        }
   
        const first = emailAddresses[0];
        if (first?.email_address) return first.email_address;
      }

   
      if (typeof userPayload?.email === "string" && userPayload.email.length) return userPayload.email;
      if (typeof userPayload?.email_address === "string" && userPayload.email_address.length)
        return userPayload.email_address;

      return null;
    } catch (e) {
      console.warn("Error extracting primary email:", e);
      return null;
    }
  };

  const getIsVerified = (userPayload: any): boolean => {
    try {
      const emailAddresses: any[] | undefined = userPayload?.email_addresses;
      const primaryId: string | undefined = userPayload?.primary_email_address_id;

      if (Array.isArray(emailAddresses)) {
      
        if (primaryId) {
          const primary = emailAddresses.find((e) => e.id === primaryId);
          if (primary) {
  
            if (primary?.verification?.status === "verified") return true;
            if (primary?.verified === true) return true;
          }
        }

        for (const e of emailAddresses) {
          if (e?.verification?.status === "verified" || e?.verified === true) return true;
        }
      }

      if (userPayload?.email_verified === true || userPayload?.verified === true) return true;

      return false;
    } catch (e) {
      console.warn("Error determining verification status:", e);
      return false;
    }
  };

  const clerkId: string | undefined = data?.id;
  if (!clerkId) {
    console.error("No clerk id in webhook payload:", data);
    return new Response("Missing clerk id", { status: 400 });
  }

  const primaryEmail = getPrimaryEmail(data);
  const isVerified = getIsVerified(data);

  const firstName = data?.first_name ?? data?.firstName ?? "";
  const middleName = data?.middle_name ?? data?.middleName ?? null;
  const lastName = data?.last_name ?? data?.lastName ?? "";

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
  
      await db.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          email: primaryEmail ?? "",
          fName: firstName || "",
          mName: middleName,
          lName: lastName || "",
          address: "", 
          isVerified,
        },
        update: {
          email: primaryEmail ?? undefined,
          fName: firstName || undefined,
          mName: middleName,
          lName: lastName || undefined,
        
          isVerified,
        },
      });

      console.log(`Upserted user ${clerkId} (verified: ${isVerified})`);
      return new Response("OK", { status: 200 });
    }

    if (eventType === "user.deleted") {
 
      try {
        await db.user.delete({
          where: { clerkId },
        });
        console.log(`Deleted user ${clerkId}`);
      } catch (e: any) {
       
        const isNotFound = e?.code === "P2025" || e?.message?.includes("Record to delete does not exist");
        if (!isNotFound) {
          console.error("Error deleting user:", e);
          return new Response("DB error", { status: 500 });
        }
        console.log(`User ${clerkId} not found in DB; nothing to delete.`);
      }
      return new Response("OK", { status: 200 });
    }

   
    console.log(`Unhandled event type: ${eventType}`);
    return new Response("Event ignored", { status: 200 });
  } catch (err) {
    console.error("Unhandled error processing webhook:", err);
    return new Response("Server error", { status: 500 });
  }
}
