import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Get admin emails from environment variable
const getAdminEmails = (): string[] => {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (!adminEmails) {
    return [];
  }
  return adminEmails.split(",").map((email) => email.trim());
};

// Custom function to run before Clerk's auth middleware
function adminAccessMiddleware(req: NextRequest) {
  const url = new URL(req.nextUrl);
  
  // Only apply this middleware to admin routes
  if (!url.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // The auth check will be handled by Clerk's authMiddleware
  // We don't need to check for userId here as authMiddleware will handle that

  // The actual email-based admin check happens in the admin page component
  // since we can't easily access the user's email from middleware
  return NextResponse.next();
}

// Export the Clerk middleware with our custom admin check
export default clerkMiddleware((auth, req) => {
  const url = new URL(req.nextUrl);
  
  // Only apply additional checks to admin routes
  if (url.pathname.startsWith("/admin")) {
    // Authentication is handled by Clerk
    // The actual email-based admin check happens in the admin page component
    // since we can't easily access the user's email from middleware
  }
  
  return NextResponse.next();
});

// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 