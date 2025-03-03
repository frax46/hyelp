"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Loader2, Star, StarHalf, MapPin, Calendar, User, MessageSquare, Trash2, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Review {
  id: string;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  isAnonymous: boolean;
  averageScore: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  questionId: string;
  score: number;
  notes: string;
  question: {
    id: string;
    text: string;
    category: string;
  };
}

interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export default function AddressPage() {
  const params = useParams();
  const router = useRouter();
  const addressId = params.addressId as string;
  const { userId, isSignedIn, getToken } = useAuth();
  
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Fetch user email
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isSignedIn) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const data = await response.json();
            setUserEmail(data.email);
          }
        } catch (err) {
          console.error("Failed to fetch user details:", err);
        }
      }
    };
    
    fetchUserDetails();
  }, [isSignedIn]);
  
  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (!addressId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to fetch from the address-specific endpoint
        const addressResponse = await fetch(`/api/addresses/${addressId}`);
        
        if (addressResponse.ok) {
          const addressData = await addressResponse.json();
          
          // Deduplicate reviews to handle potential duplicate data
          const uniqueReviewMap = new Map();
          
          addressData.reviews.forEach((review: Review) => {
            // Use a combination of userEmail and createdAt date as a unique key
            const key = `${review.userEmail || 'anonymous'}-${new Date(review.createdAt).toDateString()}`;
            
            // If this is the first occurrence or if this review has more answers, keep it
            if (!uniqueReviewMap.has(key) || 
                review.answers.length > uniqueReviewMap.get(key).answers.length) {
              uniqueReviewMap.set(key, review);
            }
          });
          
          // Convert the Map back to an array
          const uniqueReviews = Array.from(uniqueReviewMap.values());
          
          // Recalculate average rating with deduplicated reviews
          const reviewsWithScores = uniqueReviews.filter(review => review.averageScore > 0);
          const totalScore = reviewsWithScores.reduce((sum, review) => sum + review.averageScore, 0);
          const averageRating = reviewsWithScores.length > 0 
            ? parseFloat((totalScore / reviewsWithScores.length).toFixed(1))
            : 0;
            
          setAddress({
            ...addressData,
            reviews: uniqueReviews,
            reviewCount: uniqueReviews.length,
            averageRating
          });
        } else {
          // Fallback to reviews endpoint if address endpoint fails
          const reviewsResponse = await fetch(`/api/reviews?addressId=${addressId}`);
          
          if (!reviewsResponse.ok) {
            throw new Error("Failed to fetch reviews for this address");
          }
          
          const reviews = await reviewsResponse.json();
          
          if (reviews.length > 0 && reviews[0].address) {
            const addressData = reviews[0].address;
            
            // Deduplicate reviews
            const uniqueReviewMap = new Map();
            
            reviews.forEach((review: Review) => {
              // Use a combination of userEmail and createdAt date as a unique key
              const key = `${review.userEmail || 'anonymous'}-${new Date(review.createdAt).toDateString()}`;
              
              // If this is the first occurrence or if this review has more answers, keep it
              if (!uniqueReviewMap.has(key) || 
                  review.answers.length > uniqueReviewMap.get(key).answers.length) {
                uniqueReviewMap.set(key, review);
              }
            });
            
            // Convert the Map back to an array
            const uniqueReviews = Array.from(uniqueReviewMap.values());
            
            // Calculate overall average rating with deduplicated reviews
            const reviewsWithScores = uniqueReviews.filter((review: Review) => review.averageScore > 0);
            const totalScore = reviewsWithScores.reduce((sum: number, review: Review) => sum + review.averageScore, 0);
            const averageRating = reviewsWithScores.length > 0 
              ? parseFloat((totalScore / reviewsWithScores.length).toFixed(1))
              : 0;
              
            setAddress({
              id: addressData.id,
              streetAddress: addressData.streetAddress,
              city: addressData.city,
              state: addressData.state,
              zipCode: addressData.zipCode,
              formattedAddress: addressData.formattedAddress || 
                `${addressData.streetAddress}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}`,
              reviews: uniqueReviews,
              averageRating: averageRating,
              reviewCount: uniqueReviews.length
            });
          } else {
            throw new Error("No address details found");
          }
        }
      } catch (err) {
        console.error("Error fetching address details:", err);
        setError("Failed to load address details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAddressDetails();
  }, [addressId]);
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Helper to render star ratings
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />);
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    
    return (
      <div className="flex">{stars}</div>
    );
  };
  
  // Group reviews questions by category
  const groupAnswersByCategory = (answers: Answer[]) => {
    const grouped = answers.reduce((acc, answer) => {
      const category = answer.question.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(answer);
      return acc;
    }, {} as Record<string, Answer[]>);
    
    return grouped;
  };
  
  // Handle review deletion
  const deleteReview = async (reviewId: string) => {
    if (!isSignedIn) {
      setDeleteError("You must be signed in to delete a review");
      return;
    }
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete review");
      }
      
      // Remove the deleted review from the state
      if (address) {
        const updatedReviews = address.reviews.filter(review => review.id !== reviewId);
        
        // Recalculate average rating
        const reviewsWithScores = updatedReviews.filter(review => review.averageScore > 0);
        const totalScore = reviewsWithScores.reduce((sum, review) => sum + review.averageScore, 0);
        const averageRating = reviewsWithScores.length > 0 
          ? parseFloat((totalScore / reviewsWithScores.length).toFixed(1))
          : 0;
        
        setAddress({
          ...address,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          averageRating
        });
      }
      
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting review:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading address details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !address) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-6 py-12 text-center">
            <div className="bg-red-50 p-8 rounded-xl inline-block max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Address not found</h2>
              <p className="text-gray-800 mb-6">
                {error || "We couldn't find the address you're looking for."}
              </p>
              <button 
                onClick={() => router.back()}
                className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get map URL for the address
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.formattedAddress || `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`)}`;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section with address details */}
        <section className="bg-green-50 py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {address.streetAddress}
                </h1>
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPin className="h-5 w-5 text-green-700 mr-2" />
                  <span>{address.city}, {address.state} {address.zipCode}</span>
                </div>
                
                {address.reviewCount && address.reviewCount > 0 ? (
                  <div className="flex items-center gap-3 mt-4">
                    {renderRating(address.averageRating || 0)}
                    <span className="text-gray-800 font-medium">
                      {address.averageRating?.toFixed(1)} ({address.reviewCount} {address.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-4">No reviews yet</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <a 
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  View on Map
                </a>
                <Link
                  href={`/submit-review?addressId=${address.id}`}
                  className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Write a Review
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Reviews summary */}
        {address.reviewCount && address.reviewCount > 0 && (
          <section className="py-10 bg-white border-b border-gray-100">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 rounded-full p-4">
                    <div className="text-3xl font-bold text-green-700">
                      {address.averageRating?.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Overall Rating</div>
                    <div className="text-sm text-gray-600">Based on {address.reviewCount} {address.reviewCount === 1 ? 'review' : 'reviews'}</div>
                  </div>
                </div>
                
                <div className="text-gray-700">
                  <div className="font-medium">What people are saying:</div>
                  <div className="text-sm mt-1">
                    {address.averageRating && address.averageRating >= 4 
                      ? "People love this location!" 
                      : address.averageRating && address.averageRating >= 3 
                        ? "This location has mixed reviews." 
                        : "This location needs improvement."}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Reviews section */}
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {address.reviews.length > 0 
                ? `User Reviews for this Address (${address.reviews.length})` 
                : "No Reviews Yet"}
            </h2>
            
            {address.reviews.length > 0 && (
              <p className="text-gray-600 mb-8">Each review shows a user's responses to multiple questions about this address.</p>
            )}
            
            {deleteError && (
              <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <span className="text-red-700">{deleteError}</span>
              </div>
            )}
            
            {address.reviews.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl text-center">
                <p className="text-gray-700 mb-4">Be the first to review this address!</p>
                <Link
                  href={`/submit-review?addressId=${address.id}`}
                  className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors inline-flex items-center"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Write a Review
                </Link>
              </div>
            ) : (
              <div className="grid gap-8">
                {address.reviews.map((review) => {
                  const groupedAnswers = groupAnswersByCategory(review.answers);
                  // Check if user owns this review
                  const isOwnReview = 
                    isSignedIn && 
                    ((userId && review.userId === userId) || 
                     (userEmail && review.userEmail === userEmail));
                  
                  return (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {renderRating(review.averageScore)}
                            <span className="text-gray-800 font-medium">
                              {review.averageScore.toFixed(1)} overall rating
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>
                                {review.isAnonymous 
                                  ? "Anonymous User" 
                                  : review.userEmail || "Verified Resident"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-green-800">
                            <p className="font-semibold">{review.answers.length} questions answered</p>
                          </div>
                          
                          {isOwnReview && (
                            <button
                              onClick={() => setShowDeleteConfirm(review.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              aria-label="Delete review"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete confirmation dialog */}
                      {showDeleteConfirm === review.id && (
                        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-700 mb-2">Delete this review?</h4>
                          <p className="text-gray-700 text-sm mb-4">
                            This will permanently delete your review and all responses. This action cannot be undone.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => deleteReview(review.id)}
                              disabled={isDeleting}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Confirm Delete"
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                              disabled={isDeleting}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Review content by category */}
                      <div className="mt-6 space-y-6">
                        {Object.entries(groupedAnswers).map(([category, answers]) => (
                          <div key={category} className="border-t border-gray-100 pt-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-3">{category}</h3>
                            <div className="space-y-4">
                              {answers.map((answer) => (
                                <div key={answer.id} className="mb-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium text-gray-800">
                                      {answer.question.text}
                                    </div>
                                    <div className="flex">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`h-4 w-4 ${i < answer.score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  {answer.notes && (
                                    <p className="text-gray-700 text-sm">{answer.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 