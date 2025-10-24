// "use client";
// import { useUser } from "@clerk/nextjs";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function VerifyPage() {
//   const { isSignedIn, isLoaded, user } = useUser();
//   const router = useRouter();

//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push("/sign-in");
//     }

//     if (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) {
//       // Check verification status from Prisma
//       fetch("/api/auth/check-verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
//       })
//         .then(res => res.json())
//         .then(data => {
//           if (data.isVerified) router.push("/dashboard");
//         });
//     }
//   }, [isLoaded, isSignedIn, user, router]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold mb-2">🚨 Verification Required</h1>
//       <p className="text-center">
//         Please verify your email or phone number. Check your inbox for the OTP or verification link sent by Clerk.
//       </p>
//     </div>
//   );
// }


"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function VerifyPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }
    

    // Only proceed if user and primaryEmailAddress exist
    if (
      isLoaded &&
      isSignedIn &&
      user?.primaryEmailAddress?.emailAddress
    ) {
      const checkVerification = async () => {
        try {
          const email = user.primaryEmailAddress?.emailAddress;
          if (!email) return; // extra null check

          const response = await axios.post("/api/check-verify", { email });

          if (response.data.isVerified) {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Verification check failed:", error);
        }
      };

      checkVerification();
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-2">🚨 Verification Required</h1>
      <p className="text-center">
        Please verify your email or phone number. Check your inbox for the OTP or verification link sent by Clerk.
      </p>
    </div>
  );
}
