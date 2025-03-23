import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    
    if (!query || query.length < 5) {
      return NextResponse.json({ 
        suggestions: [] 
      }, { status: 200 });
    }
    
    // Search for addresses that match the query for autocomplete
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
      select: {
        id: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        formattedAddress: true,
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        city: "asc"
      },
      take: 5, // Limit results to 5 suggestions for autocomplete
    });
    
    // Transform addresses into autocomplete suggestions
    const suggestions = addresses.map(address => {
      return {
        id: address.id,
        display: `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`,
        reviewCount: address._count.reviews,
      };
    });
    
    // Sort by review count (most reviewed first)
    suggestions.sort((a, b) => b.reviewCount - a.reviewCount);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch address suggestions", suggestions: [] },
      { status: 500 }
    );
  }
} 