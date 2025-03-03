import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/app/utils/adminAccess";

// Helper function to check admin access
async function checkAdminAccess() {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }
  
  const email = user.emailAddresses?.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
  return isAdminEmail(email);
}

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const addressId = searchParams.get("addressId");
    
    // Build the where clause for filtering
    const where: any = {};
    if (addressId) {
      where.addressId = addressId;
    }
    
    // Fetch reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        address: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
    
    // Process reviews to include average score
    const processedReviews = reviews.map(review => {
      // Calculate average score from answers
      const validAnswers = review.answers.filter(answer => answer.score > 0);
      const totalScore = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = validAnswers.length > 0 
        ? parseFloat((totalScore / validAnswers.length).toFixed(1)) 
        : 0;
      
      return {
        ...review,
        averageScore,
      };
    });
    
    // Get total count for pagination
    const totalCount = await prisma.review.count({ where });
    
    return NextResponse.json({
      reviews: processedReviews,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
} 