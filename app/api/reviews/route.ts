import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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