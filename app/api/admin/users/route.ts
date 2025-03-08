import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
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
    const user = await clerkClient.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
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

// GET all users - combines Clerk user data with our DB data
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
    
    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit,
      offset,
    });
    
    // Format Clerk users for response
    const formattedClerkUsers = clerkUsers.map(user => {
      const primaryEmail = user.emailAddresses.find(
        email => email.id === user.primaryEmailAddressId
      )?.emailAddress;
      
      return {
        id: user.id,
        email: primaryEmail || "No email",
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
      };
    });
    
    // Get all user records from our database
    const localUsers = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
    });
    
    // Format local users for response
    const formattedLocalUsers = localUsers.map(user => ({
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      reviews: user._count.reviews,
    }));
    
    return NextResponse.json({
      clerkUsers: formattedClerkUsers,
      localUsers: formattedLocalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 