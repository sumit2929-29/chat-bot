import React, { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F1F7EF] flex flex-col items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="p-8 text-sm text-[#254B35]">Loading Clerk Sign Up...</div>}>
        <SignUp />
      </Suspense>
    </div>
  );
}
