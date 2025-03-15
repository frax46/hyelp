"use client";

// This component embeds the Buy Me A Coffee button
export default function BuyMeACoffeeButton() {
  return (
    <div className="flex justify-center w-full">
      <a
        href="https://www.buymeacoffee.com/annobilfrac"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 rounded-md text-white font-medium text-sm bg-[#008236] hover:bg-[#006a2b] transition-colors duration-200"
        style={{
          fontFamily: 'Lato, sans-serif',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
        }}
      >
        <img 
          src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" 
          alt="Buy me a coffee" 
          className="h-5 w-5 mr-2"
        />
        <span>Buy me a coffee</span>
      </a>
    </div>
  );
} 