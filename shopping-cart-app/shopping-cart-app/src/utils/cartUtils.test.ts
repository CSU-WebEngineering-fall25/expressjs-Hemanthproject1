import {
  calculateItemTotal,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  formatCurrency,
  isValidQuantity,
  type CartItem,
} from './cartUtils';

describe('cartUtils', () => {
  describe('calculateItemTotal', () => {
    it('multiplies price by quantity', () => {
      expect(calculateItemTotal({ id: 1, name: 'A', price: 10, quantity: 3 })).toBe(30);
    });
    it('returns 0 if quantity is 0', () => {
      expect(calculateItemTotal({ id: 1, name: 'A', price: 15.5, quantity: 0 })).toBe(0);
    });
    it('handles decimals', () => {
      expect(calculateItemTotal({ id: 1, name: 'A', price: 19.99, quantity: 2 })).toBeCloseTo(39.98);
    });
  });

  describe('calculateSubtotal', () => {
    it('sums totals of items', () => {
      const items: CartItem[] = [
        { id: 1, name: 'A', price: 10, quantity: 2 }, // 20
        { id: 2, name: 'B', price: 5, quantity: 3 },  // 15
      ];
      expect(calculateSubtotal(items)).toBe(35);
    });
    it('returns 0 for empty cart', () => {
      expect(calculateSubtotal([])).toBe(0);
    });
  });

  describe('calculateDiscount', () => {
    it('is 0 when subtotal < 50', () => {
      expect(calculateDiscount(49.99)).toBe(0);
    });
    it('is 5% when 50 ≤ subtotal < 100', () => {
      expect(calculateDiscount(50)).toBeCloseTo(2.5);
      expect(calculateDiscount(99.99)).toBeCloseTo(4.9995);
    });
    it('is 10% when subtotal ≥ 100', () => {
      expect(calculateDiscount(100)).toBe(10);
      expect(calculateDiscount(150)).toBe(15);
    });
  });

  describe('calculateTax', () => {
    it('is 8% of amount', () => {
      expect(calculateTax(100)).toBe(8);
      expect(calculateTax(12.5)).toBeCloseTo(1);
    });
    it('is 0 for amount 0', () => {
      expect(calculateTax(0)).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('subtotal - discount + tax, rounded', () => {
      const items: CartItem[] = [{ id: 1, name: 'A', price: 49.99, quantity: 1 }];
      expect(calculateTotal(items)).toBeCloseTo(53.99, 2);
    });
    it('applies 5% discount at 50', () => {
      const items: CartItem[] = [{ id: 1, name: 'A', price: 25, quantity: 2 }];
      expect(calculateTotal(items)).toBeCloseTo(51.3, 2);
    });
    it('applies 10% discount at 100', () => {
      const items: CartItem[] = [{ id: 1, name: 'A', price: 40, quantity: 3 }];
      expect(calculateTotal(items)).toBeCloseTo(116.64, 2);
    });
    it('handles empty cart', () => {
      expect(calculateTotal([])).toBe(0);
    });
    it('rounds correctly', () => {
      const items: CartItem[] = [{ id: 1, name: 'A', price: 0.1, quantity: 3 }];
      expect(calculateTotal(items)).toBe(0.32);
    });
  });

  describe('formatCurrency', () => {
    it('formats $X.YY', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(3.5)).toBe('$3.50');
      expect(formatCurrency(12.3456)).toBe('$12.35');
    });
  });

  describe('isValidQuantity', () => {
    it('accepts positive integers', () => {
      expect(isValidQuantity(1)).toBe(true);
      expect(isValidQuantity(10)).toBe(true);
    });
    it('rejects zero/negatives/non-integers', () => {
      expect(isValidQuantity(0)).toBe(false);
      expect(isValidQuantity(-1)).toBe(false);
      expect(isValidQuantity(1.1)).toBe(false);
      expect(isValidQuantity(NaN)).toBe(false);
    });
  });
});