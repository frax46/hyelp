"use client";

import { useEffect, useRef } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { ChevronRight, Home, Info, HelpCircle, MessageSquare, Search, Shield, FileText, Map, User } from "lucide-react";
import gsap from "gsap";

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: {
    title: string;
    href: string;
    description?: string;
  }[];
}

export default function SitemapPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animate section on load
    const sections = sectionRef.current?.querySelectorAll('.sitemap-section');
    if (sections && sections.length > 0) {
      gsap.fromTo(
        sections,
        { y: 30, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, []);

  const sitemapData: SitemapSection[] = [
    {
      title: "Main",
      icon: <Home className="h-5 w-5" />,
      links: [
        { title: "Home", href: "/", description: "The main landing page" },
        { title: "About", href: "/about", description: "Learn about binocolo" },
        { title: "FAQ", href: "/faq", description: "Frequently asked questions" }
      ]
    },
    {
      title: "Account",
      icon: <User className="h-5 w-5" />,
      links: [
        { title: "Sign In", href: "/sign-in", description: "Log in to your account" },
        { title: "Sign Up", href: "/sign-up", description: "Create a new account" },
        { title: "My Reviews", href: "/reviews", description: "View your submitted reviews" }
      ]
    },
    {
      title: "Reviews",
      icon: <MessageSquare className="h-5 w-5" />,
      links: [
        { title: "Write a Review", href: "/submit-review", description: "Share your experience" },
        { title: "Search", href: "/search", description: "Find neighborhoods and reviews" }
      ]
    },
    {
      title: "Support",
      icon: <HelpCircle className="h-5 w-5" />,
      links: [
        { title: "Help Center", href: "/help", description: "Find answers to common questions" },
        { title: "Contact Us", href: "/help#contact", description: "Get in touch with our team" }
      ]
    },
    {
      title: "Legal",
      icon: <Shield className="h-5 w-5" />,
      links: [
        { title: "Privacy Policy", href: "/privacy", description: "How we handle your data" },
        { title: "Terms of Service", href: "/terms", description: "Rules for using our platform" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sitemap
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Find your way around binocolo with our complete site directory.
            </p>
          </div>
          
          <div 
            ref={sectionRef}
            className="grid md:grid-cols-2 gap-10"
          >
            {sitemapData.map((section, index) => (
              <div key={index} className="sitemap-section bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.href}
                        className="group flex items-start"
                      >
                        <ChevronRight className="h-5 w-5 text-green-600 mt-0.5 transform transition-transform group-hover:translate-x-1" />
                        <div className="ml-2">
                          <span className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                            {link.title}
                          </span>
                          {link.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 