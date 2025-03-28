"use client";

import { useEffect, useRef } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { MessageSquare, Star, Search, Users, HomeIcon } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AboutPage() {
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    mission: useRef<HTMLDivElement>(null),
    howItWorks: useRef<HTMLDivElement>(null),
    whyWeStarted: useRef<HTMLDivElement>(null),
    joinUs: useRef<HTMLDivElement>(null),
  };
  
  // Register ScrollTrigger plugin
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animation
    const heroTitle = sectionRefs.hero.current?.querySelector('h1');
    if (heroTitle) {
      gsap.fromTo(
        heroTitle,
        { y: 50, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out"
        }
      );
    }
    
    const heroText = sectionRefs.hero.current?.querySelector('p');
    if (heroText) {
      gsap.fromTo(
        heroText,
        { y: 30, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out"
        }
      );
    }
    
    // Animate sections on scroll
    const sections = [
      sectionRefs.mission.current,
      sectionRefs.howItWorks.current,
      sectionRefs.whyWeStarted.current,
      sectionRefs.joinUs.current
    ];
    
    sections.forEach((section) => {
      if (section) {
        const heading = section.querySelector('h2');
        if (heading) {
          gsap.fromTo(
            heading,
            { y: 30, opacity: 0 },
            { 
              y: 0,
              opacity: 1,
              duration: 0.6,
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
              },
              ease: "power2.out"
            }
          );
        }
        
        const text = section.querySelector('p');
        if (text) {
          gsap.fromTo(
            text,
            { y: 30, opacity: 0 },
            { 
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: 0.2,
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
              },
              ease: "power2.out"
            }
          );
        }
      }
    });
    
    // Animate features
    const features = sectionRefs.howItWorks.current?.querySelectorAll('.feature-card');
    if (features && features.length > 0) {
      gsap.fromTo(
        features,
        { y: 50, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRefs.howItWorks.current,
            start: "top 70%",
          },
          ease: "back.out(1.2)"
        }
      );
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={sectionRefs.hero}
          className="bg-green-50 py-20 md:py-28"
        >
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your Guide to Living Better
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Empowering you with real, honest insights from people who've lived where you want to live.
              No sales pitches, just authentic reviews to help you find your perfect home.
            </p>
          </div>
        </section>
        
        {/* Mission Section */}
        <section 
          ref={sectionRefs.mission}
          className="py-16 md:py-20"
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  At binocolo, we believe that finding the right place to live shouldn't be a guessing game. 
                  Whether you're hunting for a new home, apartment, or just curious about a neighborhood, 
                  we're here to help you make informed decisions with real, honest insights from people who've been there.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mt-4">
                  Our mission is simple: to create a community-driven platform where people like you share their 
                  experiences about the places they've lived. From cozy houses to bustling apartment complexes, 
                  every review helps paint a clearer picture of what it's really like to call a place home.
                </p>
              </div>
              <div className="md:w-1/2 bg-green-50 rounded-lg p-8 relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-100 rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-100 rounded-full opacity-50"></div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-6 w-6 text-yellow-500 mt-1" />
                    <p className="text-gray-800">
                      <span className="font-semibold">Authentic reviews</span> from real residents
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-6 w-6 text-green-600 mt-1" />
                    <p className="text-gray-800">
                      <span className="font-semibold">Honest feedback</span> about living experiences
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <HomeIcon className="h-6 w-6 text-blue-600 mt-1" />
                    <p className="text-gray-800">
                      <span className="font-semibold">Comprehensive insights</span> about neighborhoods and properties
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section 
          ref={sectionRefs.howItWorks}
          className="py-16 md:py-20 bg-gray-50"
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              How It Works
            </h2>
            <p className="text-gray-700 text-lg text-center max-w-3xl mx-auto mb-12">
              Our database is powered by you, the users. Every rating and review contributes to helping others find their perfect home.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search</h3>
                <p className="text-gray-700">
                  Look up an address or area to discover what others have experienced living there.
                </p>
              </div>
              
              <div className="feature-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Review</h3>
                <p className="text-gray-700">
                  Share your own experiences to help others make informed decisions about where to live.
                </p>
              </div>
              
              <div className="feature-card bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Connect</h3>
                <p className="text-gray-700">
                  Join a community of people helping each other find the perfect place to call home.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why We Started Section */}
        <section 
          ref={sectionRefs.whyWeStarted}
          className="py-16 md:py-20"
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why We Started This
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Moving to a new place is always a leap of faith. You can look at photos, read descriptions, and tour the 
                  property, but until you actually live there, you never truly know what you're getting into. Too often, we 
                  found ourselves wishing we'd known about certain aspects of a neighborhood or building—little quirks or 
                  surprises (good or bad) that no one warned us about. We created binocolo to flip the script.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mt-4">
                  By crowdsourcing real experiences, we're building a resource that empowers everyone to move with confidence. 
                  Our goal is to make house-hunting and neighborhood-exploring a little less stressful and a lot more transparent.
                </p>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg transform rotate-3 opacity-60"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-4 italic text-gray-600 leading-relaxed">
                    "I wish I had known about the noise from the nearby train before moving in..."
                  </div>
                  <div className="mb-4 italic text-gray-600 leading-relaxed">
                    "The listing didn't mention how amazing the neighborhood community events would be!"
                  </div>
                  <div className="mb-4 italic text-gray-600 leading-relaxed">
                    "If only someone had told me about the parking situation before I signed the lease..."
                  </div>
                  <div className="italic text-gray-600 leading-relaxed">
                    "The schools in this area turned out to be even better than we had hoped for our kids."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Join Us Section */}
        <section 
          ref={sectionRefs.joinUs}
          className="py-16 md:py-20 bg-green-50"
        >
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Join Our Community
            </h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8">
              Share your story, rate your place, and let's help each other find the perfect spot to call home.
              Your experiences matter and can make a difference for someone searching for their next home.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/search" 
                className="px-6 py-3 bg-white text-green-700 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                <Search className="h-5 w-5 inline-block mr-2" />
                Find Places
              </Link>
              <Link 
                href="/submit-review" 
                className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
              >
                <MessageSquare className="h-5 w-5 inline-block mr-2" />
                Write a Review
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 