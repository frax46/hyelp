import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 3;
    
    // Get recent reviews with their answers
    const reviews = await prisma.review.findMany({
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
    });
    
    // Transform the data to hide user info if anonymous and calculate average score
    const transformedReviews = reviews.map(review => {
      // Calculate average score from answers
      const validAnswers = review.answers.filter(answer => answer.score > 0);
      const totalScore = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = validAnswers.length > 0 
        ? parseFloat((totalScore / validAnswers.length).toFixed(1)) 
        : 0;
      
      if (review.isAnonymous) {
        return {
          ...review,
          userId: null,
          userEmail: null,
          averageScore,
        };
      }
      return {
        ...review,
        averageScore,
      };
    });
    
    return NextResponse.json(transformedReviews);
  } catch (error) {
    console.error("Error fetching recent reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent reviews" },
      { status: 500 }
    );
  }
} 