import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from './ShoppingCart';

describe('ShoppingCart component', () => {
  const user = userEvent.setup();
  let nowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    let current = 1000;
    nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => (current += 1));
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('shows empty state initially', () => {
    render(<ShoppingCart />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('does not add item if name or price is invalid', async () => {
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText(/product name/i), 'Apple');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/product name/i));
    await user.type(screen.getByLabelText(/product name/i), 'Apple');
    await user.type(screen.getByLabelText(/product price/i), '-1');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('adds an item and shows totals', async () => {
    render(<ShoppingCart />);
    await user.type(screen.getByLabelText(/product name/i), 'Banana');
    await user.type(screen.getByLabelText(/product price/i), '2.50');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('$2.50')).toBeInTheDocument();
    expect(screen.getByText(/subtotal:\s*\$2\.50/i)).toBeInTheDocument();
    expect(screen.getByText(/discount:\s*-\$0\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/tax:\s*\$0\.20/i)).toBeInTheDocument();
    expect(screen.getByText(/total:\s*\$2\.70/i)).toBeInTheDocument();
  });

  it('updates quantity and recalculates totals', async () => {
    render(<ShoppingCart />);
    await user.type(screen.getByLabelText(/product name/i), 'Book');
    await user.type(screen.getByLabelText(/product price/i), '10');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    const qtyInput = screen.getByLabelText(/quantity for Book/i) as HTMLInputElement;

    // Directly set the value to "3" to avoid typing flakiness
    fireEvent.change(qtyInput, { target: { value: '3' } });

    await waitFor(() => {
      expect(screen.getByText(/subtotal:\s*\$30\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/discount:\s*-\$0\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/tax:\s*\$2\.40/i)).toBeInTheDocument();
      expect(screen.getByText(/total:\s*\$32\.40/i)).toBeInTheDocument();
    });
  });

  it('ignores quantity below 1', async () => {
    render(<ShoppingCart />);

    await user.type(screen.getByLabelText(/product name/i), 'Pen');
    await user.type(screen.getByLabelText(/product price/i), '5');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    const qtyInput = screen.getByLabelText(/quantity for Pen/i) as HTMLInputElement;

    // Try to set to "0"; component guard should keep it at "1"
    fireEvent.change(qtyInput, { target: { value: '0' } });

    await waitFor(() => expect(qtyInput.value).toBe('1'));
  });

  it('removes an item', async () => {
    render(<ShoppingCart />);
    await user.type(screen.getByLabelText(/product name/i), 'Item1');
    await user.type(screen.getByLabelText(/product price/i), '20');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    await user.type(screen.getByLabelText(/product name/i), 'Item2');
    await user.type(screen.getByLabelText(/product price/i), '30');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(screen.queryByText('Item1')).not.toBeInTheDocument();
    expect(screen.getByText('Item2')).toBeInTheDocument();
  });

  it('clears the cart', async () => {
    render(<ShoppingCart />);
    await user.type(screen.getByLabelText(/product name/i), 'Soda');
    await user.type(screen.getByLabelText(/product price/i), '3');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    await user.click(screen.getByRole('button', { name: /clear cart/i }));
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('applies discount tiers for multiple items', async () => {
    render(<ShoppingCart />);
    const name = screen.getByLabelText(/product name/i);
    const price = screen.getByLabelText(/product price/i);
    const addBtn = screen.getByRole('button', { name: /add to cart/i });

    await user.type(name, 'Jacket');
    await user.type(price, '60');
    await user.click(addBtn);

    await user.type(name, 'Shoes');
    await user.type(price, '50');
    await user.click(addBtn);

    expect(screen.getByText(/subtotal:\s*\$110\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/discount:\s*-\$11\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/tax:\s*\$7\.92/i)).toBeInTheDocument();
    expect(screen.getByText(/total:\s*\$106\.92/i)).toBeInTheDocument();
  });

  it('shows formatted item price', async () => {
    render(<ShoppingCart />);
    await user.type(screen.getByLabelText(/product name/i), 'Lamp');
    await user.type(screen.getByLabelText(/product price/i), '19.99');
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    const row = screen.getByText('Lamp').closest('li')!;
    expect(within(row).getByText('$19.99')).toBeInTheDocument();
  });
});
