export function formatCurrency(
  amount: number | string | null | undefined,
  includeDecimals: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '৳ 0';
  }

  const numericValue = Number(amount);
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numericValue);

  return `৳ ${formatted}`;
}
