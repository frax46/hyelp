import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/app/utils/adminAccess";

// Mark this route as dynamic since it needs to be rendered at request time
export const dynamic = 'force-dynamic';

// Helper function to check admin access with improved error handling
async function checkAdminAccess() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { 
        isAuthorized: false, 
        error: "Authentication required", 
        status: 401 
      };
    }
    
    const userEmail = user.emailAddresses?.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    console.log("API - Current user email:", userEmail);
    console.log("API - Admin emails allowed:", process.env.NEXT_PUBLIC_ADMIN_EMAILS);
    
    if (!isAdminEmail(userEmail)) {
      console.log("API - Access denied: Not an admin email");
      return { 
        isAuthorized: false, 
        error: "Unauthorized: Admin access required", 
        status: 403 
      };
    }
    
    console.log("API - Admin access granted for:", userEmail);
    return { 
      isAuthorized: true, 
      user,
      status: 200
    };
  } catch (error) {
    console.error("Error in admin authorization:", error);
    return { 
      isAuthorized: false, 
      error: "Authorization error", 
      status: 500 
    };
  }
}

export async function GET(request: NextRequest) {
  const accessCheck = await checkAdminAccess();
  
  if (!accessCheck.isAuthorized) {
    return NextResponse.json(
      { error: accessCheck.error }, 
      { status: accessCheck.status }
    );
  }

  try {
    // Get dashboard statistics
    const totalReviews = await prisma.review.count();
    const totalQuestions = await prisma.question.count();
    
    // Get total unique users by counting distinct userIds
    const uniqueUserIds = await prisma.review.groupBy({
      by: ['userId'],
      where: {
        userId: { not: null }
      }
    });
    const totalUsers = uniqueUserIds.length;
    
    // Get recent activity
    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        address: true,
        answers: true
      }
    });
    
    // For questions, use the answers to get recently answered questions
    const recentAnswers = await prisma.answer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        question: true,
        review: {
          include: {
            address: true
          }
        }
      }
    });
    
    // Get top addresses
    const topAddresses = await prisma.address.findMany({
      take: 5,
      orderBy: {
        reviews: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });
    
    // Calculate date one month ago for comparison
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Get review statistics
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

    // Get user statistics
    let usersLastMonth = 0;
    let usersMonthBeforeLast = 0;
    let userGrowthRate = 0;
    let formattedRecentUser = null;

    try {
      // Users last month
      const uniqueUsersLastMonth = await prisma.review.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: oneMonthAgo,
          },
          userId: { not: null }
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
          userId: { not: null }
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
          userEmail: true,
          createdAt: true
        }
      });

      if (mostRecentUser) {
        formattedRecentUser = {
          id: mostRecentUser.userId || 'unknown',
          email: mostRecentUser.userEmail || ('User ID: ' + (mostRecentUser.userId?.substring(0, 8) || 'unknown')),
          name: 'Anonymous User',
          createdAt: mostRecentUser.createdAt.toISOString(),
        };
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      // Provide fallback values
      userGrowthRate = 0;
    }

    // Get average rating
    const allAnswers = await prisma.answer.findMany({
      select: {
        score: true,
      },
    });
    
    const averageRating = allAnswers.length > 0
      ? allAnswers.reduce((sum, current) => sum + current.score, 0) / allAnswers.length
      : 0;

    // Prepare dashboard data
    return NextResponse.json({
      statistics: {
        totalReviews,
        totalQuestions,
        totalUsers,
        reviewGrowthRate,
        userGrowthRate,
        averageRating,
      },
      recentActivity: {
        latestReview: recentReviews[0] || null,
        latestAnswer: recentAnswers[0] || null,
        recentUser: formattedRecentUser,
      },
      topAddresses,
    });
  } catch (error) {
    console.error("Error generating dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to generate dashboard data" },
      { status: 500 }
    );
  }
} 