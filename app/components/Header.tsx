"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import gsap from "gsap";

export default function Header() {
  const { user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP animations
  useEffect(() => {
    // Header animation on load
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    // Logo animation
    gsap.fromTo(
      logoRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" }
    );

    // Nav items staggered animation
    gsap.fromTo(
      navItemsRef.current?.children || [],
      { y: -20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.4, 
        stagger: 0.1, 
        delay: 0.5, 
        ease: "power2.out" 
      }
    );
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (menuRef.current) {
      if (isMenuOpen) {
        gsap.to(menuRef.current, {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(menuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        });
      }
    }
  }, [isMenuOpen]);

  return (
    <header 
      ref={headerRef} 
      className={`sticky top-0 z-50 bg-white ${isScrolled ? "shadow-md" : "border-b border-gray-100"}`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" ref={logoRef} className="flex items-center gap-2 text-green-700 font-bold text-xl">
          <img 
            src="/images/logo.png" 
            alt="Binocolo Logo" 
            className="h-8 w-auto"
          />
          <span>Binocolo</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav ref={navItemsRef} className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-gray-700 hover:text-green-700 font-medium transition-colors">About</Link>
          <Link href="/faq" className="text-gray-700 hover:text-green-700 font-medium transition-colors">FAQ</Link>
          
          {isLoaded && user && (
            <>
              <Link href="/submit-review" className="text-gray-700 hover:text-green-700 font-medium transition-colors">Write a Review</Link>
              <Link href="/reviews" className="text-gray-700 hover:text-green-700 font-medium transition-colors">My Reviews</Link>
            </>
          )}
        </nav>
        
        {/* User Authentication */}
        <div className="flex items-center gap-4">
          {isLoaded ? (
            user ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9"
                  }
                }}
              />
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-green-700 font-medium transition-colors">Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="search-button">Sign up</button>
                </SignUpButton>
              </div>
            )
          ) : (
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div ref={menuRef} className="md:hidden overflow-hidden h-0 opacity-0 bg-white">
        <div className="container py-4 px-4 flex flex-col gap-4">
          <Link href="/about" className="text-gray-700 hover:text-green-700 py-2 font-medium">About</Link>
          <Link href="/faq" className="text-gray-700 hover:text-green-700 py-2 font-medium">FAQ</Link>
          
          {isLoaded && user && (
            <>
              <Link href="/submit-review" className="text-gray-700 hover:text-green-700 py-2 font-medium">Write a Review</Link>
              <Link href="/reviews" className="text-gray-700 hover:text-green-700 py-2 font-medium">My Reviews</Link>
            </>
          )}
          
          {isLoaded && !user && (
            <div className="flex flex-col gap-3 mt-2">
              <SignInButton mode="modal">
                <button className="w-full text-center py-2 px-4 text-sm font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full text-center py-2 px-4 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-md transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 