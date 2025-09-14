/**
 * Number formatting utilities - replacement for @wdii/numth package
 * This provides the same functionality as the original package but without JSR dependency
 */

/**
 * Format number with accounting style (comma separators, appropriate decimal places)
 * @param value - The number to format
 * @returns Formatted string with comma separators
 */
export function accountant(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '0';
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  // Format with comma separators and up to 2 decimal places
  // Remove trailing zeros after decimal point
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Format number as whole number (no decimal places)
 * @param value - The number to format
 * @returns Formatted string as whole number with comma separators
 */
export function wholeNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '0';
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '0';
  }
  
  // Round to nearest whole number and format with comma separators
  return Math.round(num).toLocaleString('en-US');
}