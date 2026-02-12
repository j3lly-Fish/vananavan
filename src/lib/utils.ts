import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format a phone number to (XXX) XXX-XXXX format
 * Accepts various formats: 1234567890, (123) 456-7890, 123-456-7890, etc.
 * Returns empty string if input is invalid
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Check if we have exactly 10 digits
    if (digits.length !== 10) return phone; // Return original if invalid

    // Format as (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Generate a tel: link from a phone number
 * Strips all formatting and returns tel:XXXXXXXXXX
 */
export function formatPhoneLink(phone: string | null | undefined): string {
    if (!phone) return '';

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Check if we have exactly 10 digits
    if (digits.length !== 10) return '';

    return `tel:${digits}`;
}

/**
 * Check if a license is expired based on expiration date
 */
export function isLicenseExpired(expiresAt: Date | null | undefined): boolean {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
}
