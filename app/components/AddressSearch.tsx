"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MapPin, Star } from "lucide-react";
import { debounce } from "lodash";
import { createPortal } from "react-dom";
import gsap from "gsap";

interface AddressSuggestion {
  id: string;
  display: string;
  reviewCount: number;
}

interface AddressSearchProps {
  onAddressSelect?: (addressId: string, displayAddress: string) => void;
  placeholder?: string;
  buttonText?: string;
  redirectToResults?: boolean;
}

export default function AddressSearch({
  onAddressSelect,
  placeholder = "Enter an address to search...",
  buttonText = "Search",
  redirectToResults = true,
}: AddressSearchProps) {
  // console.log("AddressSearch component initializing with props:", { placeholder, buttonText, redirectToResults });
  
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const router = useRouter();
  const suggestionRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Apply entrance animation on mount
  useEffect(() => {
    if (searchContainerRef.current) {
      gsap.fromTo(
        searchContainerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Skip if no suggestions are shown
      if (!showSuggestions) return;
      
      // Check if the click is outside both the input and the suggestion list
      const targetNode = event.target as Node;
      const isInputClick = inputRef.current?.contains(targetNode);
      const isSuggestionClick = suggestionRef.current?.contains(targetNode);
      
      if (!isInputClick && !isSuggestionClick) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Calculate the position immediately when the input is focused
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
      updateDropdownPosition();
    }
  };

  // Handle position updates
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Listen for scroll or resize events to update the dropdown position
  useEffect(() => {
    if (!showSuggestions) return;

    updateDropdownPosition();
    
    window.addEventListener('scroll', updateDropdownPosition);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showSuggestions]);

  // Debounced function to fetch suggestions
  const fetchSuggestions = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 5) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/addresses/autocomplete?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(data.suggestions.length > 0);
    } catch (error) {
      // console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 5) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    // Clear selected suggestion when input changes
    setSelectedSuggestion(null);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.display);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      onAddressSelect(suggestion.id, suggestion.display);
    }
  };

  // Handle search submit
  const handleSearch = () => {
    if (selectedSuggestion) {
      if (redirectToResults) {
        router.push(`/address/${selectedSuggestion.id}`);
      }
    } else if (query.length >= 3) {
      // If no suggestion selected but query is long enough, redirect to search results
      if (redirectToResults) {
        router.push(`/search?query=${encodeURIComponent(query)}`);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    }
    // Enter
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        handleSearch();
      }
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-[28rem] mx-auto">
      <div className="flex w-full shadow-lg rounded-lg overflow-hidden transition-all duration-300">
        <div className="flex-grow flex items-center bg-white border-0 rounded-l-lg pl-3">
          <MapPin className="h-5 w-5 text-green-500 mr-2" />
        <Input
            ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            className="flex-grow border-0 shadow-none h-[60px] text-lg font-medium px-1 focus:ring-0 focus:border-0 focus-visible:ring-0"
          aria-label="Search for an address"
        />
        </div>
        <Button 
          type="button" 
          onClick={handleSearch}
          className="h-[60px] rounded-l-none rounded-r-lg px-4 text-sm font-bold flex items-center justify-center gradient-btn"
          disabled={loading || (query.length < 3)}
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Suggestions dropdown with Portal */}
      {showSuggestions && suggestions.length > 0 && typeof window !== 'undefined' && createPortal(
        <ul 
          ref={suggestionRef}
          className="shadow-2xl animate-fadeIn"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999999,
            backgroundColor: 'white',
            borderRadius: '0 0 0.75rem 0.75rem',
            border: '1px solid #e0e0e0',
            borderTop: 'none',
            margin: 0,
            padding: '0.25rem 0',
            listStyle: 'none',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                flex items-center px-4 py-3 cursor-pointer transition-colors duration-200
                ${highlightedIndex === index ? 'bg-green-50' : 'hover:bg-gray-50'}
                ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}
              `}
              aria-selected={highlightedIndex === index}
            >
              <div className="flex-shrink-0 mr-3 text-green-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-grow">
                <p className="text-gray-800 font-medium">{suggestion.display}</p>
              </div>
              {suggestion.reviewCount > 0 && (
                <div className="flex items-center text-amber-500 ml-2 text-sm">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  <span>{suggestion.reviewCount}</span>
            </div>
              )}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
} 