import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Export Clerk middleware
export default clerkMiddleware();

// Configure matcher to include all routes that need to use Clerk authentication
export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    '/api/admin/:path*',
    
    // Auth-related API routes (needed for currentUser and other Clerk functions)
    '/api/auth/:path*',
    
    // User-related API routes
    '/api/user/:path*',
    '/api/reviews/:path*',
    
    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 