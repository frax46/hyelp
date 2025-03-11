"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Star, StarHalf, MapPin, Calendar, Trash2, AlertCircle } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Question {
  id: string;
  text: string;
  category: string;
}

interface Answer {
  id: string;
  questionId: string;
  score: number;
  notes: string;
  question: Question;
}

interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
}

interface Review {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  isAnonymous: boolean;
  averageScore: number;
  address: Address;
  answers: Answer[];
}

export default function ReviewsPage() {
  const router = useRouter();
  const { userId, isSignedIn, getToken } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!isSignedIn) {
        setError("You must be signed in to view your reviews");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/reviews/user');
        
        if (!response.ok) {
          throw new Error("Failed to fetch your reviews");
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching user reviews:", err);
        setError(err instanceof Error ? err.message : "Failed to load your reviews");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserReviews();
  }, [isSignedIn]);
  
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
      setReviews(reviews.filter(review => review.id !== reviewId));
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
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-6 py-12 text-center">
            <div className="bg-yellow-50 p-8 rounded-xl inline-block max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h2m-2 0h-2m-1-4l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign in required</h2>
              <p className="text-gray-800 mb-6">
                You need to sign in to view your reviews.
              </p>
              <Link 
                href="/sign-in"
                className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-6 py-12 text-center">
            <div className="bg-red-50 p-8 rounded-xl inline-block max-w-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Error loading reviews</h2>
              <p className="text-gray-800 mb-6">
                {error}
              </p>
              <button 
                onClick={() => router.refresh()}
                className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-green-50 py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Reviews
            </h1>
            <p className="text-gray-700 max-w-3xl">
              Manage all the reviews you've submitted. You can view details of each review and delete reviews if needed.
            </p>
          </div>
        </section>
        
        {/* Reviews section */}
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-6">
            {deleteError && (
              <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <span className="text-red-700">{deleteError}</span>
              </div>
            )}
            
            {reviews.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">You haven't submitted any reviews yet</h2>
                <p className="text-gray-700 mb-6">Start reviewing addresses to help others make informed decisions.</p>
                <Link
                  href="/search"
                  className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors inline-flex items-center"
                >
                  Find Places to Review
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Your Review History ({reviews.length})
                </h2>
                
                <div className="grid gap-8">
                  {reviews.map((review) => {
                    const groupedAnswers = groupAnswersByCategory(review.answers);
                    
                    return (
                      <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="mb-6">
                          <Link 
                            href={`/address/${review.address.id}`}
                            className="text-xl font-semibold text-green-700 hover:text-green-800 transition-colors"
                          >
                            {review.address.streetAddress}
                          </Link>
                          <div className="flex items-center text-gray-700 mt-1">
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{review.address.city}, {review.address.state} {review.address.zipCode}</span>
                          </div>
                        </div>
                        
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
                              
                              {review.isAnonymous && (
                                <div className="text-gray-500 text-sm">
                                  Posted anonymously
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-green-800">
                              <p className="font-semibold">{review.answers.length} questions answered</p>
                            </div>
                            
                            <button
                              onClick={() => setShowDeleteConfirm(review.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              aria-label="Delete review"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
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
              </>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 