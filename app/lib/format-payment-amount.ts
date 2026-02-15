/**
 * Format payment amount for display.
 * Handles both human amounts (e.g. "25.50") and legacy wei amounts (e.g. "25500000" for 25.50 with 6 decimals).
 */
export function formatPaymentAmount(amountStr: string): string {
  const num = parseFloat(amountStr)
  if (isNaN(num)) return '0.00'
  // Legacy: amounts stored as wei (6 decimals) have no decimal point and are >= 1e6
  const isWei = !amountStr.includes('.') && num >= 1e6
  const display = isWei ? num / 1e6 : num
  return display.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
