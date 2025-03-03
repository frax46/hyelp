"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { debounce } from "lodash";

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
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const router = useRouter();
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      console.error("Error fetching address suggestions:", error);
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

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="flex-grow"
          aria-label="Search for an address"
        />
        <Button 
          type="button" 
          onClick={handleSearch}
          className="ml-2"
          disabled={loading || (query.length < 3)}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionRef}
          className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium">{suggestion.display}</div>
              <div className="text-sm text-gray-500">
                {suggestion.reviewCount} {suggestion.reviewCount === 1 ? "review" : "reviews"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 