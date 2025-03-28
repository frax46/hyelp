"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { Search, HelpCircle, BookOpen, MessageSquare, Mail } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React from "react";

interface HelpTopic {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
}

export default function HelpPage() {
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    topics: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  const [searchQuery, setSearchQuery] = useState("");

  // Help topics
  const helpTopics: HelpTopic[] = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-8 w-8 text-green-700" />,
      description: "Learn how to navigate binocolo, search for addresses, and understand review ratings.",
      link: "#getting-started"
    },
    {
      title: "Writing Reviews",
      icon: <MessageSquare className="h-8 w-8 text-green-700" />,
      description: "Tips for writing helpful, detailed reviews that benefit the community.",
      link: "#writing-reviews"
    },
    {
      title: "Account Management",
      icon: <HelpCircle className="h-8 w-8 text-green-700" />,
      description: "Managing your profile, updating personal information, and privacy settings.",
      link: "#account-management"
    },
    {
      title: "Troubleshooting",
      icon: <Search className="h-8 w-8 text-green-700" />,
      description: "Common issues and their solutions to help you use binocolo smoothly.",
      link: "#troubleshooting"
    }
  ];

  // Register ScrollTrigger plugin
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animation
    const heroTitle = sectionRefs.hero.current?.querySelector('h1');
    if (heroTitle) {
      gsap.fromTo(
        heroTitle,
        { y: 30, opacity: 0 },
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
        { y: 20, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: "power3.out"
        }
      );
    }
    
    const heroSearch = sectionRefs.hero.current?.querySelector('.search-container');
    if (heroSearch) {
      gsap.fromTo(
        heroSearch,
        { y: 20, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out"
        }
      );
    }
    
    // Help topics animation
    const topics = sectionRefs.topics.current?.querySelectorAll('.help-topic');
    if (topics && topics.length > 0) {
      gsap.fromTo(
        topics,
        { y: 30, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRefs.topics.current,
            start: "top 80%",
          },
          ease: "power2.out"
        }
      );
    }
    
    // Contact section animation
    const contactSection = sectionRefs.contact.current;
    if (contactSection) {
      gsap.fromTo(
        contactSection,
        { y: 20, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: contactSection,
            start: "top 80%",
          },
          ease: "power2.out"
        }
      );
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Filter topics by search query
  const filteredTopics = searchQuery 
    ? helpTopics.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : helpTopics;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={sectionRefs.hero}
          className="bg-gradient-to-b from-green-50 to-white py-16 md:py-20"
        >
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How can we help?
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              Find answers, guides, and resources to help you get the most out of binocolo.
            </p>
            
            <div className="search-container max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 pl-12"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </section>
        
        {/* Help Topics Section */}
        <section 
          ref={sectionRefs.topics}
          className="py-12 md:py-16"
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Help Topics
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {filteredTopics.map((topic, index) => (
                <div 
                  key={index}
                  className="help-topic bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-all hover:shadow-md hover:border-green-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      {topic.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {topic.title}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {topic.description}
                      </p>
                      <Link href={topic.link} className="text-green-700 font-medium hover:underline flex items-center gap-1">
                        Learn more
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTopics.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No matching topics found
                </h3>
                <p className="text-gray-700 mb-4">
                  Try adjusting your search terms or browse all topics.
                </p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* Contact Section */}
        <section 
          ref={sectionRefs.contact}
          className="py-12 md:py-16 bg-green-50"
        >
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-700 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors">
              <Mail className="h-5 w-5" />
              <a href="mailto:binocoloapp@gmail.com">
                binocoloapp@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 