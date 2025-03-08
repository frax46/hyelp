"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isAdminEmail } from "@/app/utils/adminAccess";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Review = {
  id: string;
  createdAt: string;
  userEmail: string | null;
  isAnonymous: boolean;
  addressId: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  answers: Array<{
    id: string;
    score: number;
    notes: string | null;
    question: {
      id: string;
      text: string;
      category: string;
    };
  }>;
  averageScore?: number;
};

type PaginationData = {
  total: number;
  limit: number;
  offset: number;
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, limit: 10, offset: 0 });
  
  // Get unique cities for filtering
  const cities = [...new Set(reviews.map(review => review.address.city))].sort();
  
  // Check if user is admin
  useEffect(() => {
    if (!userId) return;
    
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        
        if (!isAdminEmail(data.email)) {
          // Redirect if not admin
          router.push("/");
        } else {
          // Fetch reviews if admin
          fetchReviews(1);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };
    
    checkAdmin();
  }, [userId, router]);
  
  // Fetch reviews with pagination
  const fetchReviews = async (pageNumber = page) => {
    setIsLoading(true);
    try {
      const offset = (pageNumber - 1) * limit;
      // Add filter params if they exist
      let url = `/api/admin/reviews?limit=${limit}&offset=${offset}`;
      
      if (filterCity && filterCity !== 'all') {
        // This assumes the API supports filtering by city (you might need to implement this)
        url += `&city=${encodeURIComponent(filterCity)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      
      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
      setTotal(data.pagination.total);
      setPage(pageNumber);
      
      // Apply client-side filtering for search
      applySearchFilter(data.reviews);
      
      setError("");
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply search filter
  const applySearchFilter = (reviewsToFilter: Review[]) => {
    if (!searchTerm) {
      setFilteredReviews(reviewsToFilter);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = reviewsToFilter.filter(review => 
      review.address.streetAddress.toLowerCase().includes(term) ||
      review.address.city.toLowerCase().includes(term) ||
      review.address.state.toLowerCase().includes(term) ||
      review.address.zipCode.includes(term) ||
      (review.userEmail && review.userEmail.toLowerCase().includes(term))
    );
    
    setFilteredReviews(filtered);
  };
  
  // Handle search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    applySearchFilter(reviews);
  };
  
  // Handle city filter changes
  const handleCityChange = (value: string) => {
    setFilterCity(value);
    setPage(1); // Reset to first page when changing filters
    fetchReviews(1); // Refetch with new filter
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterCity("all");
    setPage(1);
    fetchReviews(1);
  };
  
  // View review details
  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate average rating for a review
  const calculateAverageRating = (review: Review) => {
    if (review.averageScore !== undefined) {
      return review.averageScore.toFixed(1);
    }
    
    const validAnswers = review.answers.filter(answer => answer.score > 0);
    if (validAnswers.length === 0) return "N/A";
    
    const total = validAnswers.reduce((sum, answer) => sum + answer.score, 0);
    return (total / validAnswers.length).toFixed(1);
  };
  
  // Handle pagination
  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(total / limit)) return;
    fetchReviews(newPage);
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Review Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
          {error}
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Reviews</CardTitle>
          <CardDescription>Use the filters below to find specific reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search address or email..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="w-full md:w-1/3">
              <Label htmlFor="city">Filter by City</Label>
              <Select
                value={filterCity}
                onValueChange={handleCityChange}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Avg. Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading reviews...
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No reviews found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.address.streetAddress}
                    </TableCell>
                    <TableCell>{review.address.city}</TableCell>
                    <TableCell>
                      {review.isAnonymous ? (
                        <Badge variant="outline">Anonymous</Badge>
                      ) : (
                        review.userEmail || "Unknown"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">
                        {calculateAverageRating(review)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReview(review)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || isLoading}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }, (_, i) => {
                  // Calculate which pages to show
                  let pageNum: number;
                  const totalPages = Math.ceil(total / limit);
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages 1 through totalPages
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    // If near the start, show pages 1-5
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    // If near the end, show the last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 before, current, and 2 after
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => goToPage(pageNum)}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= Math.ceil(total / limit) || isLoading}
              >
                Next
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Page {page} of {Math.ceil(total / limit) || 1} · Showing {filteredReviews.length} of {total} reviews
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Review Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              {selectedReview && (
                <>
                  {formatDate(selectedReview.createdAt)} • 
                  {selectedReview.isAnonymous ? " Anonymous Review" : ` By: ${selectedReview.userEmail || "Unknown"}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-sm text-gray-700">
                  {selectedReview.address.streetAddress}, {selectedReview.address.city}, {selectedReview.address.state} {selectedReview.address.zipCode}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Ratings & Comments</h3>
                <div className="space-y-4">
                  {selectedReview.answers.map((answer) => (
                    <div key={answer.id} className="border-b pb-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{answer.question.text}</p>
                          <p className="text-sm text-gray-500">Category: {answer.question.category}</p>
                        </div>
                        <Badge className="bg-green-500">Score: {answer.score}/5</Badge>
                      </div>
                      {answer.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 italic">"{answer.notes}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                
                <div className="space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => window.open(`/address/${selectedReview.addressId}`, '_blank')}
                  >
                    View Public Page
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 