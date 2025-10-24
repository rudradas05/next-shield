
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VerifyPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

 
    if (!isSignedIn) {
      router.replace("/auth/sign-in");
      return;
    }

    const checkVerification = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
          setLoading(false);
          return;
        }

       
        const response = await axios.post("/api/check-verify", { email });

        if (response.data?.isVerified) {
         
          router.replace("/dashboard");
        } else {
      
          setLoading(false);
        }
      } catch (err) {
        console.error("Verification check failed:", err);
        setLoading(false);
      }
    };

    checkVerification();
  }, [isLoaded, isSignedIn, user, router]);

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
      <p className="max-w-md text-gray-700">
        Please verify your email address using the OTP or verification link sent
        by Clerk. Once verified, return to this page or click below.
      </p>
      <button
        onClick={() => router.push("/auth/sign-up/verify-email-address")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Resend Verification Email
      </button>
      <p className="mt-4 text-sm text-gray-500">
        After verification, refresh this page to continue.
      </p>
    </div>
  );
}

