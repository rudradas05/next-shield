"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VerifyPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }

    const checkVerification = async () => {
      try {
        const response = await axios.post("/api/check-verify");

        if (response.data.verified) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Verification check failed:", err);
        setLoading(false);
        router.push("/auth/sign-up/verify-email-address");
      }
    };

    checkVerification();
  }, [isLoaded, isSignedIn, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking verification status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-2">🚨 Verification Required</h1>
      <p>
        Please verify your email or phone number. Check your inbox for the OTP or
        verification link sent by Clerk.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push("/auth/sign-up/verify-email-address")}
      >
        Click here to resend verification email
      </button>
      <p className="mt-4 text-sm text-gray-500">
        After verification, refresh this page to continue.
      </p>
    </div>
  );
}
