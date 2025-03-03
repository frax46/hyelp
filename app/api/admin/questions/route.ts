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

// GET all questions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Get all questions, ordered by category and creation date
    const questions = await prisma.question.findMany({
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST create a new question (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Parse request body
    const { text, description, category, isActive } = await request.json();
    
    // Validate required fields
    if (!text || !category) {
      return NextResponse.json(
        { error: "Question text and category are required" },
        { status: 400 }
      );
    }
    
    // Create the question
    const question = await prisma.question.create({
      data: {
        text,
        description: description || null,
        category,
        isActive: isActive === undefined ? true : isActive,
      },
    });
    
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
} 