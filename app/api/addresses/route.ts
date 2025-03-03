import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define the address interface
interface AddressWithReviews {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  reviews: { id: string }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    
    if (!query) {
      return NextResponse.json({ error: "No search query provided" }, { status: 400 });
    }
    
    // Format the address to match our stored format
    // This is a simplified version - in a real app, you'd have a more robust solution
    const formattedQuery = query.toLowerCase().trim();
    
    // Search for addresses
    const addresses = await prisma.address.findMany({
      where: {
        OR: [
          { formattedAddress: { contains: formattedQuery, mode: "insensitive" } },
          { streetAddress: { contains: formattedQuery, mode: "insensitive" } },
          { city: { contains: formattedQuery, mode: "insensitive" } },
        ],
      },
      take: 5, // Limit results
      select: {
        id: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        formattedAddress: true,
        reviews: {
          select: {
            id: true,
          },
        },
      },
    });
    
    const results = addresses.map((address: AddressWithReviews) => ({
      ...address,
      reviewCount: address.reviews.length,
      reviews: undefined, // Remove the reviews array
    }));
    
    return NextResponse.json({
      found: results.length > 0,
      results,
    });
  } catch (error) {
    console.error("Error searching addresses:", error);
    return NextResponse.json({ error: "Failed to search addresses" }, { status: 500 });
  }
} 