"use client";

import { useEffect, useRef } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function TermsOfServicePage() {
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
              Terms of Service
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service constitute a legally binding agreement made between you and binocolo, concerning 
                your access to and use of the binocolo website and services. By accessing or using our services, you agree 
                to be bound by these Terms. If you disagree with any part of the terms, then you may not access our services.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide accurate, complete, and current information at all times. 
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p className="text-gray-700 mb-4">
                You are responsible for safeguarding the password that you use to access our services and for any activities 
                or actions under your password. We encourage you to use a strong, unique password and to not share it with any third party.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Content</h2>
              <p className="text-gray-700 mb-4">
                Our services allow you to post, link, store, share, and otherwise make available certain information, text, 
                graphics, videos, or other material. By providing User Content on our platform, you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Grant us the right to use, modify, display, and distribute the User Content for the purpose of operating and providing our services.</li>
                <li>Represent and warrant that you have all rights necessary to submit the User Content and that the User Content does not violate any law or the rights of any third party.</li>
                <li>Agree that your User Content is non-confidential and non-proprietary.</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We reserve the right to remove any User Content from our platform for any reason, without prior notice.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">
                You may not access or use the services for any purpose other than that for which we make them available. 
                The services may not be used in connection with any commercial endeavors except those that are specifically 
                endorsed or approved by us.
              </p>
              <p className="text-gray-700 mb-4">
                As a user of our services, you agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use our services in any way that violates any applicable national or international law or regulation.</li>
                <li>Post false, inaccurate, misleading, defamatory, or libelous content.</li>
                <li>Impersonate or attempt to impersonate binocolo, a binocolo employee, another user, or any other person or entity.</li>
                <li>Engage in any automated use of the system, such as using scripts to send comments or messages.</li>
                <li>Attempt to bypass any measures designed to prevent or restrict access to our services.</li>
                <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of our services.</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                Our services and their original content (excluding User Content), features, and functionality are and will remain 
                the exclusive property of binocolo and its licensors. Our services are protected by copyright, trademark, and other 
                laws of both the United States and foreign countries.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall binocolo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of 
                profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability 
                to access or use our services.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless binocolo, its parent company, subsidiaries and affiliates, and 
                their respective officers, directors, employees, contractors, agents, licensors, and suppliers from and against any 
                claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) 
                resulting from your violation of these Terms or your use of our services.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to These Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at 
                least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined 
                at our sole discretion.
              </p>
              <p className="text-gray-700">
                By continuing to access or use our services after those revisions become effective, you agree to be bound by the 
                revised terms. If you do not agree to the new terms, please stop using our services.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us at:
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