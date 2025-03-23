import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/app/utils/adminAccess";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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
    
    const { userId } = await params;
    
    // In a real implementation, you would use the Clerk SDK to get the user
    // and update your local database to track admin privileges
    // Since we don't have a User model in our Prisma schema, we'll skip DB operations
    
    // In a production app, you would also need to update your
    // environment variables or admin list to include this user
    
    return NextResponse.json({
      success: true,
      message: "User granted admin privileges (demonstration only)",
      userId: userId
    });
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 