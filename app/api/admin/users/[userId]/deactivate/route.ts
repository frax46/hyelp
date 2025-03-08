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
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    if (!userEmail || !isAdminEmail(userEmail)) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin" },
        { status: 403 }
      );
    }
    
    const targetUserId = params.userId;
    
    // In a real application, you would use the Clerk Admin API to deactivate a user
    // For this example, we'll just update the user status in our database
    
    // Check if the user exists in our database
    const existingUser = await prisma.user.findFirst({
      where: {
        userId: targetUserId,
      },
    });
    
    if (existingUser) {
      // Update the user status in our database
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          isActive: false,
        },
      });
    } else {
      // Create a new record to track this deactivated user
      await prisma.user.create({
        data: {
          userId: targetUserId,
          email: "deactivated-user",
          isActive: false,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 