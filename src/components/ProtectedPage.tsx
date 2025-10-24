"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }

    const checkVerified = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const res = await fetch("/api/check-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
      });
      const data = await res.json();
      if (data.isVerified) setVerified(true);
      else router.push("/verify");
    };

    checkVerified();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isSignedIn || verified === null) return <div>Loading...</div>;

  return <>{children}</>;
}
