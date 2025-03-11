import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/app/utils/adminAccess";

// Helper function to check if user is admin
async function checkAdminAccess() {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }
  
  const email = user.emailAddresses?.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
  return isAdminEmail(email);
}

// GET a single question by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const questionId = id;
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PUT update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const { id } = await params;
    const questionId = id;
    const { text, description, category, isActive } = await request.json();
    
    // Validate required fields
    if (!text || !category) {
      return NextResponse.json(
        { error: "Question text and category are required" },
        { status: 400 }
      );
    }
    
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });
    
    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }
    
    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        description: description || null,
        category,
        isActive: isActive === undefined ? true : isActive,
      },
    });
    
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const { id } = await params;
    const questionId = id;
    
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });
    
    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }
    
    // Check if this question has any answers
    const answerCount = await prisma.answer.count({
      where: { questionId },
    });
    
    if (answerCount > 0) {
      // If there are answers, just set to inactive rather than deleting
      const deactivatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: { isActive: false },
      });
      
      return NextResponse.json({
        ...deactivatedQuestion,
        message: "Question has existing answers and was deactivated instead of deleted"
      });
    }
    
    // Delete the question if it has no answers
    await prisma.question.delete({
      where: { id: questionId },
    });
    
    return NextResponse.json(
      { success: true, message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
} 