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
    
    // Calculate date one month ago for comparison
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Get review statistics
    const totalReviews = await prisma.review.count();
    const reviewsLastMonth = await prisma.review.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });
    const reviewsMonthBeforeLast = await prisma.review.count({
      where: {
        createdAt: {
          gte: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() - 1, oneMonthAgo.getDate()),
          lt: oneMonthAgo,
        },
      },
    });
    const reviewGrowthRate = reviewsMonthBeforeLast > 0 
      ? Math.round(((reviewsLastMonth - reviewsMonthBeforeLast) / reviewsMonthBeforeLast) * 100) 
      : 100;

    // Get user statistics - Using a different approach to count unique users
    let totalUsers = 0;
    let usersLastMonth = 0;
    let usersMonthBeforeLast = 0;
    let userGrowthRate = 0;
    let formattedRecentUser = null;

    try {
      // Get unique user IDs through groupBy instead of distinct
      const uniqueUsers = await prisma.review.groupBy({
        by: ['userId'],
      });
      totalUsers = uniqueUsers.length;
      
      // Users last month
      const uniqueUsersLastMonth = await prisma.review.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: oneMonthAgo,
          },
        },
      });
      usersLastMonth = uniqueUsersLastMonth.length;
      
      // Users month before last
      const uniqueUsersMonthBeforeLast = await prisma.review.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() - 1, oneMonthAgo.getDate()),
            lt: oneMonthAgo,
          },
        },
      });
      usersMonthBeforeLast = uniqueUsersMonthBeforeLast.length;
      
      userGrowthRate = usersMonthBeforeLast > 0 
        ? Math.round(((usersLastMonth - usersMonthBeforeLast) / usersMonthBeforeLast) * 100) 
        : 100;

      // Get most recent user with review
      const mostRecentUser = await prisma.review.findFirst({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          userId: true,
          createdAt: true
        }
      });

      if (mostRecentUser) {
        formattedRecentUser = {
          id: mostRecentUser.userId || 'unknown',
          email: 'User ID: ' + (mostRecentUser.userId?.substring(0, 8) || 'unknown'),
          name: 'Anonymous User',
          createdAt: mostRecentUser.createdAt.toISOString(),
        };
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      // Provide fallback values
      totalUsers = 0;
      userGrowthRate = 0;
    }

    // Get average rating
    const answers = await prisma.answer.findMany({
      select: {
        score: true,
      },
      where: {
        score: {
          gt: 0, // Only include scores greater than 0
        },
      },
    });
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    const averageRating = answers.length > 0 ? parseFloat((totalScore / answers.length).toFixed(1)) : 0;
    
    // Get answers from last month and month before for trend
    const answersLastMonth = await prisma.answer.findMany({
      select: {
        score: true,
      },
      where: {
        score: {
          gt: 0, // Only include scores greater than 0
        },
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });
    const answersMonthBeforeLast = await prisma.answer.findMany({
      select: {
        score: true,
      },
      where: {
        score: {
          gt: 0, // Only include scores greater than 0
        },
        createdAt: {
          gte: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() - 1, oneMonthAgo.getDate()),
          lt: oneMonthAgo,
        },
      },
    });
    
    const avgLastMonth = answersLastMonth.length > 0 
      ? answersLastMonth.reduce((sum, a) => sum + a.score, 0) / answersLastMonth.length 
      : 0;
    const avgMonthBeforeLast = answersMonthBeforeLast.length > 0 
      ? answersMonthBeforeLast.reduce((sum, a) => sum + a.score, 0) / answersMonthBeforeLast.length 
      : 0;
    
    const ratingDiff = avgLastMonth - avgMonthBeforeLast;
    const ratingTrend = Math.abs(ratingDiff) < 0.1 ? "stable" : ratingDiff > 0 ? "up" : "down";
    
    // Get active questions count
    const activeQuestions = await prisma.question.count({
      where: {
        isActive: true,
      },
    });
    
    // Get questions added in the last month
    const newQuestionsThisMonth = await prisma.question.count({
      where: {
        createdAt: {
          gte: oneMonthAgo,
        },
        isActive: true,
      },
    });
    
    // Get recent activity - modified to include answers and calculate average score
    const recentReviews = await prisma.review.findMany({
      take: 1,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        address: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
    
    // Process reviews to include average score
    const processedRecentReviews = recentReviews.map(review => {
      const validAnswers = review.answers.filter(answer => answer.score > 0);
      const totalScore = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = validAnswers.length > 0 ? parseFloat((totalScore / validAnswers.length).toFixed(1)) : 0;
      
      return {
        ...review,
        averageScore,
      };
    });
    
    const recentQuestions = await prisma.question.findMany({
      take: 1,
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    // Get top rated addresses with full review details including answers
    const addresses = await prisma.address.findMany({
      include: {
        reviews: {
          include: {
            answers: true,
          },
        },
      },
      take: 10,
    });
    
    // Process addresses to include average score for each review
    const addressesWithRatings = addresses.map(address => {
      // Process each review to include its average score
      const reviewsWithScores = address.reviews.map(review => {
        const validAnswers = review.answers.filter(answer => answer.score > 0);
        const totalScore = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
        const reviewAverage = validAnswers.length > 0 ? parseFloat((totalScore / validAnswers.length).toFixed(1)) : 0;
        
        return {
          ...review,
          averageScore: reviewAverage
        };
      });
      
      // Calculate address-level average from all review scores
      const reviewsWithValidScores = reviewsWithScores.filter(review => review.averageScore > 0);
      const addressTotalScore = reviewsWithValidScores.reduce((sum, review) => sum + review.averageScore, 0);
      const addressAverageScore = reviewsWithValidScores.length > 0 
        ? parseFloat((addressTotalScore / reviewsWithValidScores.length).toFixed(1)) 
        : 0;
      
      return {
        id: address.id,
        address: address.streetAddress,
        city: address.city,
        reviewCount: address.reviews.length,
        averageRating: addressAverageScore,
        reviews: reviewsWithScores,
      };
    });
    
    // Sort by rating and filter out addresses with no reviews
    const topAddresses = addressesWithRatings
      .filter(a => a.reviewCount > 0)
      .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount)
      .slice(0, 3);
    
    return NextResponse.json({
      statistics: {
        totalReviews,
        reviewGrowthRate,
        totalUsers,
        userGrowthRate,
        averageRating,
        ratingTrend,
        activeQuestions,
        newQuestionsThisMonth,
      },
      recentActivity: {
        latestReview: processedRecentReviews[0] || null,
        latestUser: formattedRecentUser,
        latestQuestion: recentQuestions[0] || null,
      },
      topAddresses,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
} 