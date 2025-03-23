import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/app/utils/adminAccess";

// Set caching strategy
export const dynamic = 'force-dynamic'; // Always run this route on the server

// Helper function to check admin access
async function checkAdminAccess() {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      return { isAuthorized: false, error: "Unauthorized: Not authenticated" };
    }
    
    // Use currentUser instead of clerkClient
    const user = await currentUser();
    if (!user) {
      return { isAuthorized: false, error: "Error getting user details" };
    }
    
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    if (!primaryEmail || !isAdminEmail(primaryEmail)) {
      return { isAuthorized: false, error: "Unauthorized: Not an admin" };
    }
    
    return { isAuthorized: true, user };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { isAuthorized: false, error: "Error checking admin status" };
  }
}

// GET all users endpoint
export async function GET(request: NextRequest) {
  // Get pagination parameters from URL
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  
  try {
    // Check admin access
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAuthorized) {
      return NextResponse.json(
        { error: adminCheck.error }, 
        { 
          status: 403,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          }
        }
      );
    }
    
    try {
      // Find all reviews to get unique user IDs
      // A more optimized approach when we don't have a User model
      const uniqueUsers = await prisma.review.findMany({
        where: {
          userId: { not: null },
          userEmail: { not: null },
        },
        select: {
          userId: true,
          userEmail: true,
        },
        distinct: ['userId'],
        take: limit,
        skip: offset,
      });
      
      return NextResponse.json({
        users: uniqueUsers.map(user => ({
          id: user.userId,
          email: user.userEmail,
        })),
        pagination: {
          limit,
          offset,
          total: uniqueUsers.length,
        }
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        }
      });
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      return NextResponse.json(
        { error: "Error fetching users" },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  }
} 