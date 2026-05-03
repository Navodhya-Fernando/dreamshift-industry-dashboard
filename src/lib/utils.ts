import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}


export function formatPercent(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0.0%";
  // Assuming the input is already a percentage (e.g., 12.5), not a decimal (0.125)
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num) + "%";
}


export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD", // Using AUD since the map is Australia
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}