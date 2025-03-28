"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { ChevronDown, Mail, MessageSquare, Star, Search } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface FAQItem {
  question: string;
  answer: string | ReactNode;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    faq: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };
  
  // Toggle FAQ item
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  // FAQ data
  const faqItems: FAQItem[] = [
    {
      question: "What is binocolo?",
      answer: "binocolo is a user-driven platform where people rate and review the places they've lived—houses, apartments, neighborhoods, you name it. Our goal is to help others get a real sense of what it's like to live somewhere before they make a move."
    },
    {
      question: "How does it work?",
      answer: "It's simple! Search for an address or area to see reviews and ratings from past or current residents. If you don't find what you're looking for, you're invited to add your own review based on your experience. The more people contribute, the better the resource becomes for everyone."
    },
    {
      question: "Who can write a review?",
      answer: "Anyone who's lived in or experienced a place can share their thoughts! Whether you rented, owned, or just stayed somewhere for a while, your perspective matters. All we ask is that reviews are honest and based on real experiences."
    },
    {
      question: "What if I can't find the address I'm looking for?",
      answer: "No problem! If an address isn't in our database yet, you can add it by writing a review. You'll be the first to kick things off for that spot, helping others who come after you."
    },
    {
      question: "Is this free to use?",
      answer: "Yes, absolutely! binocolo is free for everyone to browse, search, and contribute to. We're here to help, not to charge."
    },
    {
      question: "How do you make sure reviews are legit?",
      answer: "We rely on our community to keep things real. While we don't verify every detail, we encourage users to flag anything that seems off, and our team reviews reports to keep the platform trustworthy. Honest feedback is the heart of what we do!"
    },
    {
      question: "Can I edit or delete my review later?",
      answer: "Yes, you can! If your opinion changes or you move out and want to update your thoughts, just log in to edit or remove your review. We want your input to reflect your true experience."
    },
    {
      question: "What kind of info should I include in my review?",
      answer: "Whatever you think matters! Noise levels, safety, nearby amenities, landlord vibes, parking—anything that stood out to you, good or bad. The more details, the more helpful it is for others."
    },
    {
      question: "Why should I trust the reviews here?",
      answer: "Unlike polished ads or real estate listings, our reviews come straight from people who've lived it. No one's getting paid to sugarcoat things—what you see is what real residents felt. That said, everyone's experience is unique, so we encourage reading multiple reviews to get the full picture."
    },
    {
      question: "How can I get involved?",
      answer: (
        <>
          Start by searching for a place you&apos;re curious about or adding a review of somewhere you&apos;ve lived. 
          Every contribution helps grow our community and makes house-hunting easier for someone else. 
          Got feedback for us? We&apos;d love to hear it—reach out anytime!
        </>
      )
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
    
    // FAQ items animation
    const faqItems = sectionRefs.faq.current?.querySelectorAll('.faq-item');
    if (faqItems && faqItems.length > 0) {
      gsap.fromTo(
        faqItems,
        { y: 30, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRefs.faq.current,
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
        { y: 30, opacity: 0 },
        { 
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: contactSection,
            start: "top 90%",
          },
          ease: "power2.out"
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
          className="bg-green-50 py-16 md:py-20"
        >
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Find answers to common questions about using binocolo, submitting reviews, and getting involved in our community.
            </p>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section 
          ref={sectionRefs.faq}
          className="py-12 md:py-16"
        >
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="faq-item bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <h3 className="text-xl font-semibold text-gray-900">{item.question}</h3>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transition-transform ${openIndex === index ? 'transform rotate-180' : ''}`} 
                    />
                  </button>
                  <div 
                    id={`faq-answer-${index}`}
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'}`}
                    aria-hidden={openIndex !== index}
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section 
          ref={sectionRefs.contact}
          className="py-12 md:py-16 bg-green-50"
        >
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Have more questions?
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              Drop us a line at <a href="mailto:binocoloapp@gmail.com" className="text-green-700 hover:underline">binocoloapp@gmail.com</a>, and we'll get back to you as soon as we can. Happy reviewing!
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