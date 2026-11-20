import React, { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F1F7EF] flex flex-col items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="p-8 text-sm text-[#254B35]">Loading Clerk Sign In...</div>}>
        <SignIn />
      </Suspense>
    </div>
  );
}
