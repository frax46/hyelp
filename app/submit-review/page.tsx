"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReviewForm from "./ReviewForm";

type Question = {
  id: string;
  text: string;
  type: "text" | "rating";
  required: boolean;
};

type Address = {
  buildingNumber: string;
  streetName: string;
  flatNumber?: string;
  city: string;
  county: string;
  postcode: string;
};

const PLACEHOLDER_QUESTIONS: Question[] = [
  {
    id: "safety",
    text: "How safe do you feel in this neighborhood?",
    type: "rating",
    required: true,
  },
  {
    id: "noise",
    text: "How would you rate the noise level?",
    type: "rating",
    required: true,
  },
  {
    id: "amenities",
    text: "How convenient are local amenities (shops, restaurants, etc.)?",
    type: "rating",
    required: true,
  },
  {
    id: "transport",
    text: "How would you rate public transportation access?",
    type: "rating",
    required: true,
  },
  {
    id: "overall",
    text: "What is your overall rating of this neighborhood?",
    type: "rating",
    required: true,
  },
  {
    id: "pros",
    text: "What are the best things about this neighborhood?",
    type: "text",
    required: true,
  },
  {
    id: "cons",
    text: "What are the drawbacks of this neighborhood?",
    type: "text",
    required: true,
  },
];

export default function SubmitReviewPage() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get address from URL parameters
  const buildingNumber = searchParams.get("buildingNumber") || "";
  const streetName = searchParams.get("streetName") || "";
  const flatNumber = searchParams.get("flatNumber") || "";
  const city = searchParams.get("city") || "";
  const county = searchParams.get("county") || "";
  const postcode = searchParams.get("postcode") || "";
  
  // State for managing form steps
  const [currentStep, setCurrentStep] = useState(1);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Responses state
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // In a real app, fetch questions from API
    console.log("Setting questions:", PLACEHOLDER_QUESTIONS);
    setQuestions(PLACEHOLDER_QUESTIONS);
    
    // If we have a complete address from URL, validate it
    if (buildingNumber && streetName && city && county && postcode) {
      validateAddress();
    }
  }, []);

  const validateAddress = async () => {
    if (!buildingNumber || !streetName || !city || !county || !postcode) {
      setValidationError("Please complete all required address fields");
      setIsAddressValid(false);
      return;
    }
    
    setIsValidatingAddress(true);
    
    try {
      // Since we're not using an API, we'll simulate address validation
      // In a real app, you would make an API call to validate
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format the standardized address
      const address: Address = {
        buildingNumber,
        streetName,
        flatNumber,
        city,
        county,
        postcode: postcode.toUpperCase() // Ensure postcode is uppercase
      };
      
      // Set address as valid
      setIsAddressValid(true);
      setIsValidatingAddress(false);
      setValidationError(null);
      
      // If this is the first time validating, go to step 2
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    } catch (error) {
      setValidationError("Error validating address. Please try again.");
      setIsAddressValid(false);
      setIsValidatingAddress(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string | number) => {
    setResponses({
      ...responses,
      [questionId]: value,
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isAddressValid) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateResponses()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const validateResponses = () => {
    const requiredQuestions = questions.filter(q => q.required);
    const unansweredQuestions = requiredQuestions.filter(q => !(q.id in responses));
    
    return unansweredQuestions.length === 0;
  };

  const handleSubmit = async () => {
    if (!isAddressValid) {
      alert("Please validate your address before submitting");
      return;
    }
    
    if (!validateResponses()) {
      alert("Please answer all required questions");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, submit to API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create standardized address from components
      const formattedAddress = flatNumber
        ? `Flat ${flatNumber}, ${buildingNumber} ${streetName}, ${city}, ${county}, ${postcode}`
        : `${buildingNumber} ${streetName}, ${city}, ${county}, ${postcode}`;
      
      // Push to thank you page
      router.push(`/submit-review/thank-you?address=${encodeURIComponent(formattedAddress)}`);
    } catch (error) {
      alert("Error submitting review. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({ questionId, value, onChange }: { questionId: string; value: number; onChange: (value: number) => void }) => {
    return (
      <div className="flex items-center mt-2" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none focus:ring-2 focus:ring-green-600 rounded-full"
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={star === value}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 ${
                star <= value ? "text-yellow-500" : "text-gray-300"
              } hover:text-yellow-500 transition-colors`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Add the progress steps display component
  const ProgressSteps = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 2 ? "bg-green-600" : "bg-gray-300"
          }`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 3 ? "bg-green-600" : "bg-gray-300"
          }`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-700">
          <span>Address</span>
          <span>Review</span>
          <span>Submit</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto max-w-7xl px-6">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Submit an Address Review
            </h1>
            <p className="text-gray-800 text-lg">
              Share your experience to help others find their perfect location
            </p>
          </div>
        </div>
        
        <div className="container mx-auto max-w-3xl px-6 py-12">
          {!isLoaded ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-800 border-r-2"></div>
            </div>
          ) : !isSignedIn ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Sign in to continue</h2>
              <p className="text-gray-800 mb-6">
                You need to be signed in to submit a review. This helps us ensure the authenticity of reviews.
              </p>
              <button
                onClick={() => router.push("/sign-in?redirect=/submit-review")}
                className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div>
              <ProgressSteps />

              {/* Step 1: Address verification */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Step 1: Verify the Address</h2>
                  
                  <ReviewForm
                    initialAddress={{
                      buildingNumber,
                      streetName,
                      flatNumber,
                      city,
                      county,
                      postcode
                    }}
                  />
                  
                  {validationError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                      {validationError}
                    </div>
                  )}
                  
                  {isAddressValid && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                      >
                        Continue to Review
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Address Review */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Step 2: Review this Address</h2>
                  
                  <div className="p-4 bg-green-100 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-800 mb-1">Reviewing:</h3>
                    <p className="text-gray-700">{flatNumber ? `Flat ${flatNumber}, ` : ""}{buildingNumber} {streetName}, {city}, {county}, {postcode}</p>
                  </div>
                  
                  {questions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600 border-r-2 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading questions...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-8 mb-8">
                        <h3 className="font-medium text-gray-800 mb-4">Rating Questions</h3>
                        {questions.filter(q => q.type === "rating").map((question) => (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                            <label 
                              htmlFor={question.id} 
                              className="block text-gray-800 font-medium mb-3"
                            >
                              {question.text} {question.required && <span className="text-red-500">*</span>}
                            </label>
                            <StarRating
                              questionId={question.id}
                              value={(responses[question.id] as number) || 0}
                              onChange={(value) => handleResponseChange(question.id, value)}
                            />
                            {question.required && !(question.id in responses) && (
                              <p className="mt-2 text-sm text-red-500">Please provide a rating</p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-8 mb-8">
                        <h3 className="font-medium text-gray-800 mb-4">Additional Comments</h3>
                        {questions.filter(q => q.type === "text").map((question) => (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                            <label 
                              htmlFor={question.id} 
                              className="block text-gray-800 font-medium mb-3"
                            >
                              {question.text} {question.required && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                              id={question.id}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px]"
                              placeholder="Your thoughts..."
                              value={(responses[question.id] as string) || ""}
                              onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            />
                            {question.required && !(question.id in responses) && (
                              <p className="mt-2 text-sm text-red-500">Please provide your input</p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 flex justify-between">
                        <button
                          onClick={handlePrevStep}
                          className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                          Back to Address
                        </button>
                        
                        <button
                          onClick={handleNextStep}
                          className={`px-6 py-3 ${validateResponses() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-medium rounded-lg shadow-sm transition-colors`}
                          disabled={!validateResponses()}
                        >
                          Continue to Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Review and Submit */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Step 3: Confirm and Submit</h2>
                  
                  <div className="p-4 bg-green-100 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-800 mb-1">Reviewing:</h3>
                    <p className="text-gray-700">{flatNumber ? `Flat ${flatNumber}, ` : ""}{buildingNumber} {streetName}, {city}, {county}, {postcode}</p>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <h3 className="font-medium text-gray-800">Your Ratings:</h3>
                    
                    {questions.filter(q => q.type === "rating").map((question) => (
                      <div key={question.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-700">{question.text}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 ${
                                star <= (responses[question.id] as number || 0) ? "text-yellow-500" : "text-gray-300"
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <h3 className="font-medium text-gray-800">Your Comments:</h3>
                    
                    {questions.filter(q => q.type === "text").map((question) => (
                      <div key={question.id} className="py-2 border-b border-gray-100">
                        <h4 className="font-medium text-gray-700 mb-2">{question.text}</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                          {(responses[question.id] as string) || "No comment provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Back to Review
                    </button>
                    
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 