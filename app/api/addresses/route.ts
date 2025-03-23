import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Define the address interface
interface AddressWithReviews {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  reviews: {
    id: string;
    createdAt: string;
    isAnonymous: boolean;
    averageScore?: number;
    _count?: {
      answers: number;
    };
  }[];
  _count?: {
    reviews: number;
  };
  reviewCount?: number;
  averageRating?: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    
    if (!query || query.length < 3) {
      return NextResponse.json({ error: "Search query must be at least 3 characters" }, { status: 400 });
    }
    
    // Search for addresses that match the query
    const addresses = await prisma.address.findMany({
      where: {
        OR: [
          { streetAddress: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { state: { contains: query, mode: "insensitive" } },
          { zipCode: { contains: query, mode: "insensitive" } },
          { formattedAddress: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        reviews: {
          select: {
            id: true,
            createdAt: true,
            isAnonymous: true,
            answers: {
              select: {
                score: true,
                question: {
                  select: {
                    id: true,
                    text: true,
                  }
                }
              }
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        city: "asc",
      },
      take: 10, // Limit results to 10 addresses
    });
    
    // Process reviews and calculate average rating for each address
    const addressesWithRatings = addresses.map((address) => {
      // Process each review to include its average score
      const reviewsWithScores = address.reviews.map(review => {
        const validAnswers = review.answers.filter(answer => answer.score > 0);
        const totalScore = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
        const reviewAverage = validAnswers.length > 0 
          ? parseFloat((totalScore / validAnswers.length).toFixed(1)) 
          : 0;
        
        return {
          ...review,
          averageScore: reviewAverage,
        };
      });
      
      // Calculate average rating for the address from all review scores
      const validReviews = reviewsWithScores.filter(review => review.averageScore > 0);
      const totalRating = validReviews.reduce((sum, review) => sum + review.averageScore, 0);
      const averageRating = validReviews.length > 0 
        ? parseFloat((totalRating / validReviews.length).toFixed(1)) 
        : 0;
      
      return {
        ...address,
        reviews: reviewsWithScores,
        reviewCount: address._count?.reviews || 0,
        averageRating,
      };
    });
    
    return NextResponse.json(addressesWithRatings);
  } catch (error) {
    console.error("Error searching addresses:", error);
    return NextResponse.json(
      { error: "Failed to search addresses" },
      { status: 500 }
    );
  }
} 