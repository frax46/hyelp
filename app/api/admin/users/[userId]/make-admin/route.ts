import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
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
    
    // Get the user from Clerk to find their email
    // In a real implementation, you would use the Clerk SDK to get the user
    
    // Check if the user exists in our database
    const existingUser = await prisma.user.findFirst({
      where: {
        userId: targetUserId,
      },
    });
    
    if (existingUser) {
      // Update the user role in our database
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          role: "admin",
        },
      });
    } else {
      // We need the user's email to create a record
      // In a real app, we would get this from Clerk's API
      // For this example, we'll use a placeholder
      await prisma.user.create({
        data: {
          userId: targetUserId,
          email: "new-admin@example.com", // In reality, get from Clerk API
          role: "admin",
        },
      });
    }
    
    // In a production app, you would also need to update your
    // environment variables or admin list to include this user
    
    return NextResponse.json({
      success: true,
      message: "User granted admin privileges",
    });
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 