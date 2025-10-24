"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp path="/auth/sign-up" routing="path" signInUrl="/auth/sign-in" />
      
    </div>
  );
}
