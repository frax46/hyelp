import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Get current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Extract the primary email address
    const primaryEmail = user.emailAddresses?.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    
    // Return user data
    return NextResponse.json({
      id: user.id,
      email: primaryEmail,
      name: `${user.firstName} ${user.lastName}`.trim() || user.username || "Unknown User",
      imageUrl: user.imageUrl
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
} 