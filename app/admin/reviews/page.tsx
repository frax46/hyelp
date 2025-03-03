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
  CardTitle 
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
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [error, setError] = useState("");
  
  // Get unique cities for filtering
  const cities = [...new Set(reviews.map(review => review.address.city))].sort();
  
  // Check if user is admin
  useEffect(() => {
    if (!userId) return;
    
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/admin/user");
        const data = await response.json();
        
        if (!isAdminEmail(data.email)) {
          // Redirect if not admin
          router.push("/");
        } else {
          // Fetch reviews if admin
          fetchReviews();
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };
    
    checkAdmin();
  }, [userId, router]);
  
  // Fetch all reviews
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/reviews");
      
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      
      const data = await response.json();
      setReviews(data);
      setFilteredReviews(data);
      setError("");
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters when search term or city filter changes
  useEffect(() => {
    let filtered = reviews;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.address.streetAddress.toLowerCase().includes(term) ||
        review.address.city.toLowerCase().includes(term) ||
        review.address.state.toLowerCase().includes(term) ||
        review.address.zipCode.includes(term) ||
        (review.userEmail && review.userEmail.toLowerCase().includes(term))
      );
    }
    
    // Apply city filter
    if (filterCity) {
      filtered = filtered.filter(review => 
        review.address.city === filterCity
      );
    }
    
    setFilteredReviews(filtered);
  }, [searchTerm, filterCity, reviews]);
  
  // View review details
  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate average rating for a review
  const calculateAverageRating = (review: Review) => {
    if (!review.answers.length) return 0;
    
    const sum = review.answers.reduce((total, answer) => total + answer.score, 0);
    return (sum / review.answers.length).toFixed(1);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Review Management</h1>
        <p>Loading reviews...</p>
      </div>
    );
  }
  
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/3">
              <Label htmlFor="city">Filter by City</Label>
              <Select
                value={filterCity}
                onValueChange={setFilterCity}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCity("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
          <CardDescription>
            Showing {filteredReviews.length} of {reviews.length} total reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No reviews found
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