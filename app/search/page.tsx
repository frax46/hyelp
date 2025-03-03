"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AddressSearch from "../components/AddressSearch";

interface Address {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  reviewCount: number;
  averageRating: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!searchQuery || searchQuery.length < 3) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/addresses?query=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }
        
        const data = await response.json();
        setAddresses(data);
      } catch (err) {
        setError("Failed to fetch addresses. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAddresses();
  }, [searchQuery]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Search Results
            </h1>
            <p className="text-gray-800 text-lg mb-8">
              {searchQuery ? (
                <>Showing results for <span className="font-medium">{searchQuery}</span></>
              ) : (
                "Please enter a search query"
              )}
            </p>
            
            {/* Search Bar with Autocomplete */}
            <div className="max-w-3xl">
              <AddressSearch 
                placeholder="Refine your search..."
                buttonText="Search"
                redirectToResults={true}
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-6 py-12">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-800 border-r-2"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 p-6 rounded-lg inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-lg font-medium">{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md font-medium hover:bg-red-200 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid gap-8">
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        <Link 
                          href={`/address/${address.id}`}
                          className="text-gray-800 hover:text-green-600 transition-colors"
                        >
                          {address.streetAddress}
                        </Link>
                      </h3>
                      <div className="flex flex-col space-y-1 mb-3">
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{address.streetAddress}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>{address.city}, {address.state}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span>{address.zipCode}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        {address.reviewCount > 0 ? (
                          <>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star} 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className={`h-5 w-5 ${star <= Math.round(address.averageRating) ? 'text-yellow-500' : 'text-gray-300'}`} 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-800">
                              {address.averageRating.toFixed(1)} ({address.reviewCount} {address.reviewCount === 1 ? 'review' : 'reviews'})
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-700">No reviews yet</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Link 
                        href={`/address/${address.id}`}
                        className="px-4 py-2 bg-green-200 text-green-800 rounded-lg font-medium hover:bg-green-300 transition-colors"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={`/submit-review?addressId=${address.id}`}
                        className="px-4 py-2 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
                      >
                        Write a Review
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-16">
              <div className="bg-green-50 p-8 rounded-xl inline-block max-w-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">No addresses found</h2>
                <p className="text-gray-800 mb-6">
                  We couldn't find any addresses matching "{searchQuery}". Be the first to add a review!
                </p>
                <div className="flex justify-center">
                  <Link
                    href={`/submit-review?address=${encodeURIComponent(searchQuery)}`}
                    className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
                  >
                    Add this Address
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 