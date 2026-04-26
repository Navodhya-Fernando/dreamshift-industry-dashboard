import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely without style conflicts.
 * Essential for building dynamic, premium UI components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numbers with commas (e.g., 12500 -> "12,500")
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Formats numbers as percentages (e.g., 12.5 -> "12.5%")
 */
export function formatPercent(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0.0%";
  // Assuming the input is already a percentage (e.g., 12.5), not a decimal (0.125)
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num) + "%";
}

/**
 * Formats currency if you ever need to track revenue (e.g., 5000 -> "$5,000")
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD", // Using AUD since the map is Australia
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}