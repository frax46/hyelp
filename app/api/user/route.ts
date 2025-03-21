import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Set route to be dynamically rendered at request time, not statically generated
export const dynamic = 'force-dynamic';
// Remove the revalidate setting as it conflicts with force-dynamic
// export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" }, 
        { status: 401 }
      );
    }
    
    // Prepare the response with only necessary data
    const userData = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
} 