import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names and merges tailwind classes properly
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
} 