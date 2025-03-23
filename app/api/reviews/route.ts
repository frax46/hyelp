import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// GET reviews by address
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const addressId = searchParams.get("addressId");
    
    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }
    
    // Get reviews for the address with their answers
    const reviews = await prisma.review.findMany({
      where: {
        addressId,
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
    
    // Transform the data to hide user info if the review is anonymous and calculate average score
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
    
    // Deduplicate reviews to handle potential duplicates in the data
    const uniqueReviewMap = new Map();
    
    transformedReviews.forEach(review => {
      // Use a combination of userEmail and createdAt date as a unique key
      const key = `${review.userEmail || 'anonymous'}-${new Date(review.createdAt).toDateString()}`;
      
      // If this is the first occurrence or if this review has more answers, keep it
      if (!uniqueReviewMap.has(key) || 
          review.answers.length > uniqueReviewMap.get(key).answers.length) {
        uniqueReviewMap.set(key, review);
      }
    });
    
    // Convert the Map back to an array of unique reviews
    const uniqueReviews = Array.from(uniqueReviewMap.values());
    
    return NextResponse.json(uniqueReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const userId = user?.id;
    
    const { streetAddress, city, state, zipCode, answers, isAnonymous } = await request.json();
    
    // Validate required fields
    if (!streetAddress || !city || !state || !zipCode) {
      return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
    }
    
    // Format address to ensure consistent storage
    const formattedAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`.toLowerCase();
    
    // Create or find address
    let address = await prisma.address.findUnique({
      where: {
        formattedAddress,
      },
    });
    
    if (!address) {
      address = await prisma.address.create({
        data: {
          streetAddress,
          city,
          state,
          zipCode,
          formattedAddress,
        },
      });
    }
    
    // Create review
    const review = await prisma.review.create({
      data: {
        addressId: address.id,
        userId: userId || undefined,
        userEmail: user?.emailAddresses?.[0]?.emailAddress || undefined,
        isAnonymous,
      },
    });
    
    // Create answers for each question
    const answerPromises = Object.entries(answers).map(([questionId, answerData]) => {
      const { score, notes } = answerData as { score: number; notes: string };
      return prisma.answer.create({
        data: {
          questionId,
          reviewId: review.id,
          score,
          notes,
        },
      });
    });
    
    await Promise.all(answerPromises);
    
    return NextResponse.json({
      success: true,
      reviewId: review.id,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get("reviewId");
    
    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }
    
    // First check if the review exists and belongs to the requesting user
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });
    
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    
    // Check if the user owns this review
    if (review.userId !== user.id && review.userEmail !== user.emailAddresses[0]?.emailAddress) {
      return NextResponse.json({ error: "You can only delete your own reviews" }, { status: 403 });
    }
    
    // Delete all answers associated with this review first
    await prisma.answer.deleteMany({
      where: {
        reviewId: reviewId,
      },
    });
    
    // Then delete the review itself
    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Review and all associated answers have been deleted" 
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
} 