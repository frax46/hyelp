"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Button } from "./components/Button";
import { Card, CardContent, CardTitle, CardDescription } from "./components/Card";
import AddressSearch from "./components/AddressSearch";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Review interfaces
interface ReviewQuestion {
  id: string;
  text: string;
  category: string;
}

interface ReviewAnswer {
  id: string;
  score: number;
  notes: string | null;
  question: ReviewQuestion;
}

interface ReviewAddress {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Review {
  id: string;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  isAnonymous: boolean;
  addressId: string;
  address: ReviewAddress;
  answers: ReviewAnswer[];
  averageScore: number;
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  
  // Fetch recent reviews
  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const response = await fetch('/api/reviews/recent?limit=3');
        if (!response.ok) {
          throw new Error('Failed to fetch recent reviews');
        }
        const data = await response.json();
        setRecentReviews(data);
      } catch (error) {
        console.error('Error fetching recent reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchRecentReviews();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLElement>(null);
  
  // GSAP animations
  useEffect(() => {
    // Hero section animations
    const heroTl = gsap.timeline();
    
    heroTl.fromTo(
      headingRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    ).fromTo(
      descriptionRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    ).fromTo(
      searchFormRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.3"
    ).fromTo(
      imageContainerRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );
    
    // Features section animations with ScrollTrigger
    if (featuresRef.current && typeof window !== "undefined") {
      const featureItems = featuresRef.current.querySelectorAll('.feature-card');
      
      gsap.fromTo(
        featureItems,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section with Glass Morphism */}
      <section ref={heroRef} className="hero-section">
        <div className="glass-container">
          <h1 ref={headingRef}>
            Find your <span className="highlight">perfect</span> neighborhood
          </h1>
          <p ref={descriptionRef}>
            Discover your ideal place to live with honest reviews from real residents.
          </p>
          
          {/* Search Bar with Autocomplete */}
          <div ref={searchFormRef} className="search-container">
            <AddressSearch 
              placeholder="Enter an address"
              buttonText="Search"
              redirectToResults={true}
            />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center text-xl font-medium text-gray-800 uppercase tracking-wide mb-12">
            Trusted by homebuyers across the country
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Partner 1</span>
            </div>
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Partner 2</span>
            </div>
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Partner 3</span>
            </div>
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Partner 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="section features">
        <div className="container">
          <h2 className="section-title">
            Why Choose <span>Hyelp</span>
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="feature-title">Real Resident Reviews</h3>
              <p className="feature-description">Get authentic insights from people who actually live in the neighborhood, not paid advertisers.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="feature-title">Detailed Neighborhood Data</h3>
              <p className="feature-description">Explore comprehensive information about safety, amenities, schools, and community vibe.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="feature-title">Verified Information</h3>
              <p className="feature-description">We verify reviewers to ensure you're getting trustworthy information about potential neighborhoods.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section ref={howItWorksRef} className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            How <span>Hyelp</span> Works
          </h2>
          
          <div className="features-grid">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">1</div>
              <h3 className="feature-title">Search a Neighborhood</h3>
              <p className="feature-description">Enter an address or neighborhood name to find detailed information and reviews.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">2</div>
              <h3 className="feature-title">Explore Reviews & Data</h3>
              <p className="feature-description">Read authentic reviews from residents and explore comprehensive neighborhood data.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">3</div>
              <h3 className="feature-title">Share Your Experience</h3>
              <p className="feature-description">Contribute to the community by sharing your own neighborhood experiences.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <button 
              onClick={() => scrollToSection(searchRef)}
              className="search-button px-8 py-3"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section ref={searchRef} className="section">
        <div className="container text-center">
          <h2 className="section-title">
            Find Your Perfect <span>Neighborhood</span>
          </h2>
          <p className="text-gray-700 mb-10 max-w-2xl mx-auto">
            Enter any address or neighborhood name to discover what locals love and what to watch out for.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <AddressSearch 
              placeholder="Search by address, city, or zip code..."
              buttonText="Find Reviews"
              redirectToResults={true}
            />
          </div>
        </div>
      </section>

      {/* Featured Neighborhoods */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            Recent <span>Reviews</span>
          </h2>
          
          <div className="features-grid">
            {isLoadingReviews ? (
              <div className="col-span-3 flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : recentReviews.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p>No reviews available yet.</p>
              </div>
            ) : (
              recentReviews.map((review, index) => (
                <div key={review.id} className="feature-card">
                  <div className="h-40 bg-green-50 mb-4 rounded flex items-center justify-center">
                    <span className="text-green-700">{review.address.city} Review</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="feature-title">{review.address.streetAddress}</h3>
                      <div className="flex items-center">
                        <span className="text-green-700 font-medium mr-1">{review.averageScore.toFixed(1)}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <p className="feature-description mb-4">
                      {review.address.city}, {review.address.state} - {formatDate(review.createdAt)}
                    </p>
                    {review.answers.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded italic text-sm text-gray-600">
                        {review.answers.find((a: ReviewAnswer) => a.notes)?.notes || 
                         `Rating: ${review.averageScore.toFixed(1)} out of 5`}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        {review.isAnonymous ? "Anonymous" : (review.userEmail || "Unknown")}
                      </span>
                      <button 
                        className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors duration-300"
                        onClick={() => router.push(`/address/${review.addressId}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            What Our <span>Users Say</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Hyelp helped me find the perfect neighborhood for my family. The reviews were honest and gave me a real sense of the community before we moved.",
                author: "Sarah Johnson",
                role: "New Homeowner"
              },
              {
                quote: "As someone who travels frequently for work, I use Hyelp to research neighborhoods in new cities. It's been an invaluable resource for finding safe and convenient areas.",
                author: "Michael Chen",
                role: "Business Traveler"
              }
            ].map((testimonial, index) => (
              <div key={index} className="feature-card">
                <div className="flex flex-col h-full">
                  <svg className="h-8 w-8 text-green-500 mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-gray-800 mb-6 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 overflow-hidden relative flex items-center justify-center">
                      <span className="text-green-700 font-bold">{testimonial.author.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-green-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Perfect Neighborhood?
          </h2>
          <p className="text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have found their ideal community using Hyelp's neighborhood insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="search-button bg-white text-green-700 hover:bg-gray-100">
              Sign Up Free
            </button>
            <button className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded hover:bg-white/10 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
