"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Type definitions
interface Question {
  id: string;
  text: string;
  description: string;
  category: string;
  type: "rating" | "text";
  required: boolean;
  orderIndex: number;
  isActive: boolean;
}

interface FormData {
  buildingNumber: string;
  streetName: string;
  flatNumber: string;
  city: string;
  county: string;
  postcode: string;
  answers: {
    [key: string]: {
      score: number;
      notes: string;
    };
  };
}

interface ReviewFormProps {
  initialAddress?: {
    buildingNumber: string;
    streetName: string;
    flatNumber: string;
    city: string;
    county: string;
    postcode: string;
  };
}

// UK counties list for validation
const UK_COUNTIES = [
  "Avon", "Bedfordshire", "Berkshire", "Buckinghamshire", "Cambridgeshire", 
  "Cheshire", "Cleveland", "Cornwall", "Cumbria", "Derbyshire", "Devon", 
  "Dorset", "Durham", "East Sussex", "Essex", "Gloucestershire", "Hampshire", 
  "Herefordshire", "Hertfordshire", "Isle of Wight", "Kent", "Lancashire", 
  "Leicestershire", "Lincolnshire", "London", "Merseyside", "Middlesex", 
  "Norfolk", "Northamptonshire", "Northumberland", "North Yorkshire", 
  "Nottinghamshire", "Oxfordshire", "Rutland", "Shropshire", "Somerset", 
  "South Yorkshire", "Staffordshire", "Suffolk", "Surrey", "Tyne and Wear", 
  "Warwickshire", "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", 
  "Worcestershire",
  // Scotland
  "Aberdeenshire", "Angus", "Argyll", "Ayrshire", "Banffshire", "Berwickshire",
  "Clackmannanshire", "Dumfriesshire", "Dunbartonshire", "East Lothian", "Fife",
  "Inverness-shire", "Kincardineshire", "Kinross-shire", "Kirkcudbrightshire",
  "Lanarkshire", "Midlothian", "Moray", "Nairnshire", "Orkney", "Peeblesshire",
  "Perthshire", "Renfrewshire", "Ross and Cromarty", "Roxburghshire", "Selkirkshire",
  "Shetland", "Stirlingshire", "Sutherland", "West Lothian", "Wigtownshire",
  // Wales
  "Anglesey", "Brecknockshire", "Caernarfonshire", "Cardiganshire", "Carmarthenshire",
  "Denbighshire", "Flintshire", "Glamorgan", "Merionethshire", "Monmouthshire",
  "Montgomeryshire", "Pembrokeshire", "Radnorshire",
  // Northern Ireland
  "Antrim", "Armagh", "Down", "Fermanagh", "Londonderry", "Tyrone"
];

// Sample questions for testing - in a real app, these would be fetched from an API
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "safety",
    text: "How safe do you feel in this neighborhood?",
    description: "Consider crime rates, street lighting, and overall security",
    category: "Safety",
    type: "rating",
    required: true,
    orderIndex: 1,
    isActive: true
  },
  {
    id: "cleanliness",
    text: "How clean is the neighborhood?",
    description: "Consider litter, street cleaning services, and general maintenance",
    category: "Environment",
    type: "rating",
    required: true,
    orderIndex: 2,
    isActive: true
  },
  {
    id: "noise",
    text: "How would you rate the noise level?",
    description: "Consider traffic noise, neighbors, and general noise pollution",
    category: "Environment",
    type: "rating",
    required: true,
    orderIndex: 3,
    isActive: true
  },
  {
    id: "transport",
    text: "How well-connected is public transportation?",
    description: "Consider access to buses, trains, and other public transport options",
    category: "Amenities",
    type: "rating",
    required: true,
    orderIndex: 4,
    isActive: true
  },
  {
    id: "shopping",
    text: "How convenient are local shops and services?",
    description: "Consider grocery stores, pharmacies, and other essential shops",
    category: "Amenities",
    type: "rating",
    required: true,
    orderIndex: 5,
    isActive: true
  }
];

export default function ReviewForm({ initialAddress }: ReviewFormProps) {
  const router = useRouter();
  
  // State management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    buildingNumber: initialAddress?.buildingNumber || "",
    streetName: initialAddress?.streetName || "",
    flatNumber: initialAddress?.flatNumber || "",
    city: initialAddress?.city || "",
    county: initialAddress?.county || "",
    postcode: initialAddress?.postcode || "",
    answers: {}
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  
  // Address validation schema using Zod
  const addressSchema = z.object({
    buildingNumber: z.string().min(1, "Building number is required"),
    streetName: z.string().min(1, "Street name is required"),
    flatNumber: z.string().optional(),
    city: z.string().min(1, "Town/City is required"),
    county: z.string().min(1, "County is required"),
    postcode: z.string().regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i, 
      "Please enter a valid UK postcode (e.g. SW1A 1AA)"
    )
  });
  
  // Initialize questions data
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch questions from API instead of using sample data
        const response = await fetch('/api/questions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const fetchedQuestions = await response.json();
        
        // Filter only active questions
        const activeQuestions = fetchedQuestions.filter((q: Question) => q.isActive);
        
        // Sort by order index if available
        const sortedQuestions = activeQuestions.sort((a: Question, b: Question) => 
          (a.orderIndex || 0) - (b.orderIndex || 0)
        );
        
        setQuestions(sortedQuestions);
        
        // Initialize answers with default values
        const initialAnswers: { [key: string]: { score: number; notes: string } } = {};
        sortedQuestions.forEach((q: Question) => {
          initialAnswers[q.id] = { score: 0, notes: "" };
        });
        
        setFormData(prev => ({
          ...prev,
          answers: initialAnswers
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading review questions:', err);
        setError('Error loading review questions. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  // If there's an initial address, validate it automatically
  useEffect(() => {
    if (
      initialAddress?.buildingNumber && 
      initialAddress?.streetName && 
      initialAddress?.city && 
      initialAddress?.county && 
      initialAddress?.postcode
    ) {
      setAddressValidated(true);
      setCurrentStep(2);
    }
  }, [initialAddress]);
  
  // Format address inputs
  const formatStreetName = (value: string): string => {
    let formatted = value.trim()
      .replace(/\s+/g, " ")
      .replace(/(\b\w)/g, (char) => char.toUpperCase());
    
    // Standardize street abbreviations
    const streetTypes: {[key: string]: string} = {
      "Street": "St",
      "Road": "Rd",
      "Avenue": "Ave",
      "Lane": "Ln",
      "Drive": "Dr",
      "Court": "Ct",
      "Place": "Pl",
      "Terrace": "Terr",
      "Gardens": "Gdns",
      "Crescent": "Cres",
      "Close": "Cl",
      "Square": "Sq"
    };
    
    Object.entries(streetTypes).forEach(([full, abbr]) => {
      const regex = new RegExp(`\\b${full}\\b`, 'i');
      formatted = formatted.replace(regex, abbr);
    });
    
    return formatted;
  };

  const formatCity = (value: string): string => {
    return value.trim()
      .replace(/\s+/g, " ")
      .replace(/(\b\w)/g, (char) => char.toUpperCase());
  };

  const formatCounty = (value: string): string => {
    return value.trim()
      .replace(/\s+/g, " ")
      .replace(/(\b\w)/g, (char) => char.toUpperCase());
  };

  const formatPostcode = (value: string): string => {
    const cleaned = value.trim().toUpperCase().replace(/[^\dA-Z]/g, '');
    
    if (cleaned.length > 3) {
      const inwardCode = cleaned.substring(cleaned.length - 3);
      const outwardCode = cleaned.substring(0, cleaned.length - 3);
      return `${outwardCode} ${inwardCode}`;
    }
    
    return cleaned;
  };

  // Handle form input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Apply field-specific formatting
    if (name === "streetName") {
      formattedValue = formatStreetName(value);
    } else if (name === "city") {
      formattedValue = formatCity(value);
    } else if (name === "county") {
      formattedValue = formatCounty(value);
    } else if (name === "postcode") {
      formattedValue = formatPostcode(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Clear validation error when user is typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleRatingChange = (questionId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: {
          ...prev.answers[questionId],
          score
        }
      }
    }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>, questionId: string) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: {
          ...prev.answers[questionId],
          notes: value
        }
      }
    }));
  };
  
  // Validate and proceed with address
  const validateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { buildingNumber, streetName, flatNumber, city, county, postcode } = formData;
    const addressData = { buildingNumber, streetName, flatNumber, city, county, postcode };
    
    try {
      addressSchema.parse(addressData);
      setAddressValidated(true);
      setCurrentStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: {[key: string]: string} = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(newErrors);
      }
    }
  };
  
  // Get standardized address string
  const getStandardizedAddress = (): string => {
    const { buildingNumber, streetName, flatNumber, city, county, postcode } = formData;
    
    let addressLine = `${buildingNumber} ${streetName}`;
    if (flatNumber) {
      addressLine = `Flat ${flatNumber}, ${addressLine}`;
    }
      
    return `${addressLine}, ${city}, ${county}, ${postcode}`.trim();
  };
  
  // Check if all required questions have been answered
  const validateRatings = (): boolean => {
    const requiredQuestions = questions.filter(q => q.required);
    const unansweredQuestions = requiredQuestions.filter(
      q => formData.answers[q.id]?.score === 0
    );
    
    return unansweredQuestions.length === 0;
  };
  
  // Handle final form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRatings()) {
      setError("Please provide a rating for all required questions");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Extract address information for API
      const { buildingNumber, streetName, flatNumber, city, county, postcode, answers } = formData;
      
      // Create address in format expected by API
      const streetAddress = flatNumber 
        ? `Flat ${flatNumber}, ${buildingNumber} ${streetName}`
        : `${buildingNumber} ${streetName}`;
      
      // Convert UK county to state for API compatibility
      const state = county;
      const zipCode = postcode;
      
      // Make actual API call to submit the review
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streetAddress,
          city,
          state,
          zipCode,
          answers
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      const data = await response.json();
      
      // Redirect to thank you page
      router.push(`/submit-review/thank-you?address=${encodeURIComponent(getStandardizedAddress())}`);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Error submitting review. Please try again later.');
      setIsSubmitting(false);
    }
  };
  
  // Rating stars component
  const RatingStars = ({ questionId, value }: { questionId: string; value: number }) => {
    return (
      <div className="flex items-center" role="group" aria-label={`Rating for ${questionId}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(questionId, star)}
            className={`w-8 h-8 mr-1 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500 ${
              star <= value 
                ? "text-yellow-400" 
                : "text-gray-300"
            }`}
            aria-label={`Rate ${star} out of 5`}
            aria-pressed={star === value}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12" aria-live="polite" aria-busy="true">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-red-600 underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Step 1: Address */}
      {currentStep === 1 && (
        <form onSubmit={validateAddress} className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Step 1: Enter Address Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="buildingNumber" className="block text-gray-700 mb-2">
                  Building Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="buildingNumber"
                  name="buildingNumber"
                  value={formData.buildingNumber}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-invalid={!!validationErrors.buildingNumber}
                  aria-describedby={validationErrors.buildingNumber ? "buildingNumber-error" : undefined}
                  className={`w-full p-3 border ${validationErrors.buildingNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="123"
                />
                {validationErrors.buildingNumber && (
                  <p id="buildingNumber-error" className="mt-1 text-red-500 text-sm">{validationErrors.buildingNumber}</p>
                )}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="streetName" className="block text-gray-700 mb-2">
                  Street Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="streetName"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-invalid={!!validationErrors.streetName}
                  aria-describedby={validationErrors.streetName ? "streetName-error" : undefined}
                  className={`w-full p-3 border ${validationErrors.streetName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="High St"
                />
                {validationErrors.streetName && (
                  <p id="streetName-error" className="mt-1 text-red-500 text-sm">{validationErrors.streetName}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="flatNumber" className="block text-gray-700 mb-2">
                Flat Number <span className="text-gray-400 text-sm">(optional)</span>
              </label>
              <input
                type="text"
                id="flatNumber"
                name="flatNumber"
                value={formData.flatNumber}
                onChange={handleAddressChange}
                aria-required="false"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="4B"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label htmlFor="city" className="block text-gray-700 mb-2">
                  Town/City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-invalid={!!validationErrors.city}
                  aria-describedby={validationErrors.city ? "city-error" : undefined}
                  className={`w-full p-3 border ${validationErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="London"
                />
                {validationErrors.city && (
                  <p id="city-error" className="mt-1 text-red-500 text-sm">{validationErrors.city}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="county" className="block text-gray-700 mb-2">
                  County <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-invalid={!!validationErrors.county}
                  aria-describedby={validationErrors.county ? "county-error" : undefined}
                  className={`w-full p-3 border ${validationErrors.county ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Greater London"
                />
                {validationErrors.county && (
                  <p id="county-error" className="mt-1 text-red-500 text-sm">{validationErrors.county}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="postcode" className="block text-gray-700 mb-2">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  aria-invalid={!!validationErrors.postcode}
                  aria-describedby={validationErrors.postcode ? "postcode-error" : undefined}
                  className={`w-full p-3 border ${validationErrors.postcode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="SW1A 1AA"
                />
                {validationErrors.postcode && (
                  <p id="postcode-error" className="mt-1 text-red-500 text-sm">{validationErrors.postcode}</p>
                )}
              </div>
            </div>

            {/* Display standardized address preview */}
            {(formData.buildingNumber && formData.streetName && formData.city && formData.county) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Standardized Address Preview:</h3>
                <p className="text-gray-800">{getStandardizedAddress()}</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Continue to Ratings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 2: Ratings */}
      {currentStep === 2 && addressValidated && (
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Step 2: Rate the Neighborhood</h2>
          
          <div className="mb-6 p-4 bg-green-100 rounded-lg">
            <h3 className="font-semibold text-gray-800">Reviewing:</h3>
            <p className="text-gray-700">{getStandardizedAddress()}</p>
          </div>
          
          <div className="space-y-8">
            {questions.map((question) => (
              <div key={question.id} className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{question.text}</h3>
                <p className="text-gray-700 mb-4 text-sm">{question.description}</p>
                
                <div className="mb-4">
                  <RatingStars 
                    questionId={question.id} 
                    value={formData.answers[question.id]?.score || 0} 
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                  {question.required && formData.answers[question.id]?.score === 0 && (
                    <p className="mt-1 text-red-500 text-sm">This rating is required</p>
                  )}
                </div>
                
                <label htmlFor={`notes-${question.id}`} className="block text-gray-700 mb-2 text-sm">
                  Additional comments (optional)
                </label>
                <textarea
                  id={`notes-${question.id}`}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Share more about your experience..."
                  value={formData.answers[question.id]?.notes || ""}
                  onChange={(e) => handleNotesChange(e, question.id)}
                ></textarea>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back to Address
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!validateRatings()}
              className={`px-6 py-3 ${validateRatings() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review and Submit */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Step 3: Review and Submit</h2>
          
          <div className="mb-6 p-4 bg-green-100 rounded-lg">
            <h3 className="font-semibold text-gray-800">Reviewing:</h3>
            <p className="text-gray-700">{getStandardizedAddress()}</p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Your Ratings</h3>
            
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="flex items-center justify-between">
                  <span className="text-gray-700">{question.text}</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2">{formData.answers[question.id]?.score || 0}/5</span>
                    {/* Show stars for visual representation */}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 ${
                            star <= (formData.answers[question.id]?.score || 0)
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show comments if any */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Your Comments</h3>
              {questions.some(q => formData.answers[q.id]?.notes) ? (
                <div className="space-y-4 mt-4">
                  {questions
                    .filter(q => formData.answers[q.id]?.notes)
                    .map(question => (
                      <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-2">{question.text}</h4>
                        <p className="text-gray-600">{formData.answers[question.id]?.notes}</p>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-500 mt-2">No additional comments provided</p>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back to Ratings
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
        </form>
      )}
    </div>
  );
} 