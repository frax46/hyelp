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
import Link from "next/link";
import HeroCarousel from "./components/HeroCarousel";
import BuyMeACoffeeButton from "./components/BuyMeACoffeeButton";
import FormattedDate from './components/FormattedDate';

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

      {/* Hero Section with Carousel */}
      <section ref={heroRef} className="hero-section-carousel">
        <HeroCarousel />
        
        {/* Search Bar Overlay - responsive positioning for all devices */}
        <div className="absolute bottom-24 md:top-1/2 md:-translate-y-1/2 right-0 md:right-8 lg:right-12 xl:right-24 2xl:right-32 z-30 w-full px-4 md:px-0 md:w-auto md:max-w-xs lg:max-w-sm xl:max-w-md">
          <div ref={searchFormRef} className="search-container glass-search-container">
            <div className="mb-4 text-white text-sm uppercase tracking-wider font-medium">Find Your Neighborhood</div>
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
              <Image src="/images/logo.png" alt="Binocolo Logo" width={90} height={30} />
            </div>
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Real Estate Partner</span>
            </div>
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Moving Service</span>
            </div>
            <div className="w-32 h-12 flex items-center justify-center bg-white rounded shadow-sm">
              <span className="text-gray-400 font-medium">Home Inspector</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="section features">
        <div className="container">
          <h2 className="section-title">
            Why Choose <span>Binocolo</span>
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M9.5 6.5C9.5 8.43 7.93 10 6 10S2.5 8.43 2.5 6.5 4.07 3 6 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5S2.5 19.43 2.5 17.5 4.07 14 6 14s3.5 1.57 3.5 3.5zm11-11c0 1.93-1.57 3.5-3.5 3.5S13.5 8.43 13.5 6.5 15.07 3 17 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-12.75-3h7.5c.41 0 .75.34.75.75s-.34.75-.75.75h-7.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75z" />
                </svg>
              </div>
              <h3 className="feature-title">Real Resident Reviews</h3>
              <p className="feature-description">Get authentic insights from people who actually live in the neighborhood, not paid advertisers.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M9.5 6.5C9.5 8.43 7.93 10 6 10S2.5 8.43 2.5 6.5 4.07 3 6 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5S2.5 19.43 2.5 17.5 4.07 14 6 14s3.5 1.57 3.5 3.5zm11-11c0 1.93-1.57 3.5-3.5 3.5S13.5 8.43 13.5 6.5 15.07 3 17 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-12.75-3h7.5c.41 0 .75.34.75.75s-.34.75-.75.75h-7.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75z" />
                </svg>
              </div>
              <h3 className="feature-title">Detailed Neighborhood Data</h3>
              <p className="feature-description">Explore comprehensive information about safety, amenities, schools, and community vibe.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M9.5 6.5C9.5 8.43 7.93 10 6 10S2.5 8.43 2.5 6.5 4.07 3 6 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5S2.5 19.43 2.5 17.5 4.07 14 6 14s3.5 1.57 3.5 3.5zm11-11c0 1.93-1.57 3.5-3.5 3.5S13.5 8.43 13.5 6.5 15.07 3 17 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-12.75-3h7.5c.41 0 .75.34.75.75s-.34.75-.75.75h-7.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75z" />
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
            How <span>Binocolo</span> Works
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
                <div key={review.id} className="feature-card flex flex-col">
                  <div className="h-40 bg-green-50 mb-4 rounded flex items-center justify-center flex-col">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-16 h-16 text-green-600 mb-2"
                    >
                      <path d="M9.5 6.5C9.5 8.43 7.93 10 6 10S2.5 8.43 2.5 6.5 4.07 3 6 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5S2.5 19.43 2.5 17.5 4.07 14 6 14s3.5 1.57 3.5 3.5zm11-11c0 1.93-1.57 3.5-3.5 3.5S13.5 8.43 13.5 6.5 15.07 3 17 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-12.75-3h7.5c.41 0 .75.34.75.75s-.34.75-.75.75h-7.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75z" />
                    </svg>
                    <span className="text-green-700 font-medium">{review.address.city} Review</span>
                </div>
                  <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                      <h3 className="feature-title truncate pr-2">{review.address.streetAddress}</h3>
                      <div className="flex items-center flex-shrink-0">
                        <span className="text-green-700 font-medium mr-1">{review.averageScore.toFixed(1)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                    <p className="feature-description mb-4 text-sm overflow-hidden text-ellipsis">
                      {review.address.city}, {review.address.state} - <FormattedDate dateString={review.createdAt} format="short" />
                    </p>
                    {review.answers.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded italic text-sm text-gray-600 overflow-hidden">
                        {review.answers.find((a: ReviewAnswer) => a.notes)?.notes || 
                         `Rating: ${review.averageScore.toFixed(1)} out of 5`}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-gray-500 text-sm truncate mr-2 max-w-[50%]">
                        {review.isAnonymous ? "Anonymous" : (review.userEmail || "Unknown")}
                      </span>
                      <button 
                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-300 whitespace-nowrap shadow-sm"
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
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full opacity-10" 
            style={{
              backgroundImage: "url('/images/house-2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(2px)"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-700/20 to-green-500/20"></div>
        </div>
        
        <div className="container relative z-10">
          <h2 className="section-title">
            What Our <span>Users Will Say</span>
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
            We're excited to grow our community of users and add new features. Your feedback will help shape the future of Binocolo.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Binocolo helped me find the perfect neighborhood for my family. The reviews were honest and gave me a real sense of the community before we moved.",
                author: "Sarah Johnson",
                role: "New Homeowner"
              },
              {
                quote: "As someone who travels frequently for work, I use Binocolo to research neighborhoods in new cities. It's been an invaluable resource for finding safe and convenient areas.",
                author: "Michael Chen",
                role: "Business Traveler"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-8 w-8 text-green-600"
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M9.5 6.5C9.5 8.43 7.93 10 6 10S2.5 8.43 2.5 6.5 4.07 3 6 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5S2.5 19.43 2.5 17.5 4.07 14 6 14s3.5 1.57 3.5 3.5zm11-11c0 1.93-1.57 3.5-3.5 3.5S13.5 8.43 13.5 6.5 15.07 3 17 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-12.75-3h7.5c.41 0 .75.34.75.75s-.34.75-.75.75h-7.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75z" />
                    </svg>
                    <Link
                      href="/submit-review"
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                      title="Add your own review"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Add review</span>
                    </Link>
                  </div>
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
          
          <div className="mt-12 flex justify-center">
            <Link 
              href="/submit-review" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-300 flex items-center shadow-md"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Join Our Growing Community
            </Link>
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
            Join thousands of users who have found their ideal community using Binocolo's neighborhood insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/about" 
              className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="section bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full opacity-5" 
            style={{
              backgroundImage: "url('/images/green-house.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(3px)"
            }}
          ></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 md:p-12 border border-white/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="flex justify-center mb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-green-600"
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M9.5 6.5C9.5 8.43 7.93 10 6 10S2.5 8.43 2.5 6.5 4.07 3 6 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5S2.5 19.43 2.5 17.5 4.07 14 6 14s3.5 1.57 3.5 3.5zm11-11c0 1.93-1.57 3.5-3.5 3.5S13.5 8.43 13.5 6.5 15.07 3 17 3s3.5 1.57 3.5 3.5zm0 11c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-12.75-3h7.5c.41 0 .75.34.75.75s-.34.75-.75.75h-7.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75z" />
                  </svg>
                </div>
                
                <div className="w-full flex justify-center">
                  <BuyMeACoffeeButton />
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                    <path d="M12 16V12" />
                    <path d="M12 8H12.01" />
                  </svg>
                  Your Neighborhood Guide Needs Your Help
                </h3>
                
                <p className="text-gray-700 text-lg mb-4">
                  Remember searching for your perfect neighborhood? The uncertainty, the questions, the research?
                </p>
                
                <p className="text-gray-800 font-semibold text-lg mb-6">
                  Binocolo exists to make that journey easier for everyone through real, honest reviews.
                </p>
                
                <div className="bg-white/60 backdrop-blur-sm p-5 rounded-lg border border-green-100 mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">As a donation-supported platform, we're committed to:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Keeping our service free and accessible to all</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Providing unbiased neighborhood insights without corporate influence</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Building features that truly serve house hunters, not advertisers</span>
                    </li>
                  </ul>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Your support—no matter the size—directly powers the tools that help families find their forever homes and individuals discover communities where they belong.
                </p>
                
                <p className="text-gray-800 font-semibold text-lg mb-2">
                  Be the reason someone finds their perfect neighborhood.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
