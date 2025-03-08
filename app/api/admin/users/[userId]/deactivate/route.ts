import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/app/utils/adminAccess";

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Not authenticated" },
        { status: 401 }
      );
    }
    
    const userEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    if (!userEmail || !isAdminEmail(userEmail)) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin" },
        { status: 403 }
      );
    }
    
    const targetUserId = params.userId;
    
    // In a real application, you would use the Clerk Admin API to deactivate a user
    // Since our Prisma schema doesn't have a User model, we'll track user status in a different way
    // You could create a UserStatus collection in your database or use Clerk's API

    // For demonstration purposes, we'll return a success response
    // In a production app, implement actual user deactivation logic
    
    return NextResponse.json({
      success: true,
      message: "User deactivated successfully (demonstration only)",
      userId: targetUserId
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 