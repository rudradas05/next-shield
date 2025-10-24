// "use client";
// import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function Dashboard() {
//   const { isSignedIn, user, isLoaded } = useUser();
//   const router = useRouter();
//   const [verified, setVerified] = useState<boolean | null>(null);

//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push("/sign-in");
//       return;
//     }

//     const checkVerified = async () => {
//       if (!user?.primaryEmailAddress?.emailAddress) return;

//       const res = await fetch("/api/auth/check-verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
//       });
//       const data = await res.json();
//       if (data.isVerified) setVerified(true);
//       else router.push("/verify"); // optional verify page
//     };

//     checkVerified();
//   }, [isLoaded, isSignedIn, user, router]);

//   if (!isSignedIn || verified === null) return <div>Loading...</div>;

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-3xl font-bold text-green-600">✅ Dashboard</h1>
//       <p>{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
//     </main>
//   );
// }


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
    if (isLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }

    const checkVerified = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const response = await axios.post("/api/check-verify", {
          email: user.primaryEmailAddress.emailAddress,
        });
        await axios.post("/api/webhooks");

        if (response.data.isVerified) {
          setVerified(true);
        } else {
          router.push("/verify"); // redirect to verification page
        }
      } catch (error) {
        console.error("Verification check failed:", error);
      }
    };

    checkVerified();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isSignedIn || verified === null) return <div>Loading...</div>;

  return (
    <ProtectedPage>
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-green-600">✅ Dashboard</h1>
      <p>{user.fullName || user.primaryEmailAddress?.emailAddress}</p>
    </main>
    </ProtectedPage>
  );
}
