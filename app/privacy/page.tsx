"use client";

import { useEffect, useRef } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function PrivacyPolicyPage() {
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    content: useRef<HTMLDivElement>(null),
  };
  
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
    
    // Content section animation
    const contentSections = sectionRefs.content.current?.querySelectorAll('section');
    if (contentSections && contentSections.length > 0) {
      contentSections.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 20, opacity: 0 },
          { 
            y: 0,
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
            },
            ease: "power2.out"
          }
        );
      });
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
          className="bg-gradient-to-b from-green-50 to-white py-12 md:py-16"
        >
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Last updated: May 1, 2024
            </p>
          </div>
        </section>
        
        {/* Content Section */}
        <div 
          ref={sectionRefs.content}
          className="py-8 md:py-12"
        >
          <div className="container mx-auto px-6 max-w-4xl">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to binocolo. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
              <p className="text-gray-700">
                Please read this privacy policy carefully before using our services.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect several types of information from and about users of our website, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>
                  <span className="font-medium">Personal information:</span> Name, email address, and other contact details you provide when creating an account.
                </li>
                <li>
                  <span className="font-medium">Usage data:</span> Information about how you interact with our website, including browsing patterns, pages visited, and features used.
                </li>
                <li>
                  <span className="font-medium">Review content:</span> The reviews, ratings, and comments you post on our platform.
                </li>
                <li>
                  <span className="font-medium">Technical data:</span> IP address, browser type, device information, and other technology identifiers when you access our website.
                </li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>Personalizing your experience on our platform</li>
                <li>Communicating with you about our services, updates, and promotions</li>
                <li>Analyzing usage patterns to improve our website and services</li>
                <li>Preventing fraudulent activities and ensuring the security of our platform</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to collect and track information about your interactions with our website. 
                These technologies help us provide a better user experience, analyze site usage, and improve our services.
              </p>
              <p className="text-gray-700">
                You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. 
                If you disable or refuse cookies, please note that some parts of our website may become inaccessible or not function properly.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
                used, accessed, altered, or disclosed in an unauthorized way. We limit access to your personal data to those 
                employees, agents, contractors, and other third parties who have a business need to know.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>The right to access your personal data</li>
                <li>The right to request correction of your personal data</li>
                <li>The right to request deletion of your personal data</li>
                <li>The right to restrict processing of your personal data</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page 
                and updating the "Last updated" date at the top of this policy. You are advised to review this privacy policy periodically for any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-gray-700 font-medium">binocolo</p>
                <p className="text-gray-700">Email: binocoloapp@gmail.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 