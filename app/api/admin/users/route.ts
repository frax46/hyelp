import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/app/utils/adminAccess";

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return { isAuthorized: false, error: "Unauthorized: Not authenticated" };
  }
  
  try {
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
  try {
    // Check admin access
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAuthorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }
    
    // Get pagination parameters from URL
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    
    try {
      // Since we don't have direct access to Clerk user list via server components
      // and we don't have a User model in Prisma, we'll return a simple response
      // In a real application, you would implement proper user fetching
      
      return NextResponse.json({
        message: "Unable to list users due to schema constraints",
        note: "This API would normally list all users, but the current database schema doesn't support a User model",
        params: { limit, offset }
      });
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      return NextResponse.json(
        { error: "Error fetching users" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 