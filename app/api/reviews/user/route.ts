import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }
    
    // Get all reviews by this user
    const reviews = await prisma.review.findMany({
      where: {
        userEmail,
      },
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
    });
    
    // Transform the data to calculate average score for each review
    const transformedReviews = reviews.map(review => {
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
    
    return NextResponse.json(transformedReviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reviews" },
      { status: 500 }
    );
  }
} 