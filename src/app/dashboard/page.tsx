

"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedPage from "@/components/ProtectedPage";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    
    if (!isLoaded) return;

    
    if (!isSignedIn) {
      router.replace("/auth/sign-in");
      return;
    }

    
    const checkVerified = async () => {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      try {
        const response = await axios.post("/api/check-verify", { email });
        const isVerified = response.data?.isVerified ?? false;

        if (isVerified) {
          setVerified(true);
        } else {
          router.replace("/verify");
        }
      } catch (error) {
        console.error("Verification check failed:", error);
      }
    };

    checkVerified();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isSignedIn || verified === null)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Checking verification...
      </div>
    );

  return (
    <ProtectedPage>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-green-600">✅ Dashboard</h1>
        <p className="mt-2 text-gray-700">
          Welcome, {user.fullName || user.primaryEmailAddress?.emailAddress}
        </p>
      </main>
    </ProtectedPage>
  );
}
