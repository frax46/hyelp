import type { Metadata } from "next";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin section of the application",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full">
      <SignedIn>
        {/* Only render the children if the user is signed in */}
        {children}
      </SignedIn>
      <SignedOut>
        {/* Redirect to sign-in if the user is signed out */}
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
} 