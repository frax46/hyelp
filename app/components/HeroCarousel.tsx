"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  description: string;
}

export default function HeroCarousel() {
  // console.log("HeroCarousel component initializing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  
  const images: CarouselImage[] = [
    {
      src: "/images/green-house.jpg",
      alt: "Green house with garden",
      title: "DESIGN HOMES",
      subtitle: "PERFECT",
      description: "Discover neighborhoods that match your lifestyle and preferences. Our community reviews help you find the ideal place to call home."
    },
    {
      src: "/images/house-1.jpg",
      alt: "Modern house design",
      title: "MODERN LIVING",
      subtitle: "STYLISH",
      description: "Explore contemporary neighborhoods with cutting-edge amenities and urban convenience. Find your perfect modern living space."
    },
    {
      src: "/images/house-2.jpg",
      alt: "Scenic house in nature",
      title: "NATURAL SETTINGS",
      subtitle: "PEACEFUL",
      description: "Connect with nature in neighborhoods surrounded by scenic beauty. Enjoy tranquil environments with outdoor recreation opportunities."
    },
    {
      src: "/images/house-3.jpg",
      alt: "Family house with backyard",
      title: "FAMILY HOMES",
      subtitle: "COMMUNITY",
      description: "Discover communities ideal for families with great schools, parks, and safe streets. Find the perfect neighborhood to raise children."
    }
  ];
  
  // console.log("Images array initialized with", images.length, "images");

  const goToSlide = (index: number) => {
    // console.log("goToSlide called with index:", index);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    // console.log("goToPrevious called, current index:", currentIndex);
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    // console.log("New index after goToPrevious:", newIndex);
  };

  const goToNext = () => {
    // console.log("goToNext called, current index:", currentIndex);
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    // console.log("New index after goToNext:", newIndex);
  };

  // Auto-advance slides
  useEffect(() => {
    // console.log("Auto-advance effect running, setting up interval");
    const slideInterval = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => {
      // console.log("Cleaning up auto-advance interval");
      clearInterval(slideInterval);
    };
  }, [currentIndex]);

  // Animation with GSAP
  useEffect(() => {
    // console.log("GSAP animation effect running after index change to:", currentIndex);
    if (carouselRef.current) {
      const contentElement = carouselRef.current.querySelector(".carousel-content");
      if (contentElement) {
        // console.log("Animating carousel content element");
        gsap.fromTo(
          contentElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      } else {
        // console.error("Could not find carousel-content element");
      }
    } else {
      // console.error("carouselRef.current is null");
    }
  }, [currentIndex]);

  // console.log("HeroCarousel rendering with currentIndex:", currentIndex);
  return (
    <div className="relative w-full h-full overflow-hidden" ref={carouselRef}>
      {/* Main carousel */}
      <div className="absolute inset-0 transition-opacity duration-500">
        {images.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image.src})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
          </div>
        ))}
      </div>

      {/* Carousel content */}
      <div className="carousel-content relative z-10 flex flex-col items-start justify-center h-full px-8 sm:px-12 py-20 md:py-32 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-3xl">
          <div className="mb-3 text-gray-200 text-sm sm:text-base tracking-widest font-medium flex items-center gap-2">
            <Image 
              src="/images/logo.png" 
              alt="Binocolo Logo" 
              width={24} 
              height={24} 
              className="h-6 w-auto"
            />
            BINOCOLO
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold mb-1 text-white tracking-wide">
            {images[currentIndex].title}
          </h1>
          <h2 className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-bold mb-6 text-green-500 tracking-wide">
            {images[currentIndex].subtitle}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-xl lg:max-w-2xl">
            {images[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Carousel controls - arrow navigation */}
      <div className="absolute bottom-12 left-8 sm:left-12 md:left-16 lg:left-24 xl:left-32 z-20 flex space-x-3">
        <button 
          onClick={goToPrevious}
          className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={goToNext}
          className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnails */}
      <div 
        ref={thumbsRef}
        className="absolute bottom-8 right-8 sm:right-12 md:right-16 lg:right-24 xl:right-32 z-20 hidden md:flex space-x-3"
      >
        {images.map((image, index) => (
          <div 
            key={index}
            onClick={() => goToSlide(index)}
            className={`cursor-pointer w-16 h-16 lg:w-20 lg:h-20 rounded-md overflow-hidden transition-all ${
              index === currentIndex ? "border-2 border-green-500 scale-105" : "border border-white/40"
            }`}
          >
            <div className="relative w-full h-full">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image.src})` }}
              />
              <div className={`absolute inset-0 ${index === currentIndex ? "bg-black/10" : "bg-black/40"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 