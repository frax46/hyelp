'use client';

import { useState, useEffect } from 'react';

interface FormattedDateProps {
  dateString: string;
  format?: 'long' | 'short' | 'relative';
}

export default function FormattedDate({ dateString, format = 'long' }: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  useEffect(() => {
    try {
      const date = new Date(dateString);
      
      if (format === 'long') {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        setFormattedDate(date.toLocaleDateString('en-US', options));
      } else if (format === 'short') {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        };
        setFormattedDate(date.toLocaleDateString('en-US', options));
      } else if (format === 'relative') {
        // Calculate relative time (e.g., "2 days ago")
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          setFormattedDate('Today');
        } else if (diffDays === 1) {
          setFormattedDate('Yesterday');
        } else if (diffDays < 7) {
          setFormattedDate(`${diffDays} days ago`);
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          setFormattedDate(`${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`);
        } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          setFormattedDate(`${months} ${months === 1 ? 'month' : 'months'} ago`);
        } else {
          const years = Math.floor(diffDays / 365);
          setFormattedDate(`${years} ${years === 1 ? 'year' : 'years'} ago`);
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      setFormattedDate(dateString); // Fallback to the original string
    }
  }, [dateString, format]);
  
  // Return loading state before client-side hydration
  if (!formattedDate) {
    return <span>...</span>;
  }
  
  return <span>{formattedDate}</span>;
} 