import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest, 
  { params }: { params: { addressId: string } }
) {
  try {
    const addressId = await params.addressId;
    
    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }
    
    // Fetch the address with its reviews
    const address = await prisma.address.findUnique({
      where: {
        id: addressId,
      },
      include: {
        reviews: {
          include: {
            answers: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });
    
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
    
    // Calculate average rating and process reviews
    const processedReviews = address.reviews.map(review => {
      const validAnswers = review.answers.filter(answer => answer.score > 0);
      const totalScore = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = validAnswers.length > 0 
        ? parseFloat((totalScore / validAnswers.length).toFixed(1)) 
        : 0;
      
      // Hide user info if the review is anonymous
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
    
    processedReviews.forEach(review => {
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
    
    // Calculate overall address average rating with deduplicated reviews
    const reviewsWithScores = uniqueReviews.filter(review => review.averageScore > 0);
    const totalRating = reviewsWithScores.reduce((sum, review) => sum + review.averageScore, 0);
    const averageRating = reviewsWithScores.length > 0 
      ? parseFloat((totalRating / reviewsWithScores.length).toFixed(1)) 
      : 0;
    
    // Count of unique reviews
    const reviewCount = uniqueReviews.length;
    
    return NextResponse.json({
      ...address,
      reviews: uniqueReviews,
      reviewCount,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
} 