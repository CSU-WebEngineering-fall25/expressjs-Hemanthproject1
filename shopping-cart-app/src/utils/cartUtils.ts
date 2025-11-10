export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
export function calculateItemTotal(item: CartItem): number {
  return item.price * item.quantity;
}
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}
export function calculateDiscount(subtotal: number): number {
  if (subtotal >= 100) return subtotal * 0.1;
  if (subtotal >= 50) return subtotal * 0.05;
  return 0;
}
export function calculateTax(amount: number): number {
  return amount * 0.08;
}
export function calculateTotal(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal);
  const afterDiscount = subtotal - discount;
  const tax = calculateTax(afterDiscount);
  return Number((afterDiscount + tax).toFixed(2));
}
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}