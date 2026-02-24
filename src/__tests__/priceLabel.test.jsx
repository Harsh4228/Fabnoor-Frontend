import React from 'react'
import { render, screen } from '@testing-library/react'
import Collection from '../pages/Collection'
import Product from '../pages/Product'
import Cart from '../pages/Cart'
import { ShopContext } from '../context/ShopContext'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mockProduct = {
  _id: 'p1',
  name: 'Test Pack',
  category: 'Test',
  subCategory: 'Sub',
  variants: [
    { color: 'Red', type: 'A', price: 200, sizes: ['S', 'M'], code: 'CODE123' },
    { color: 'Blue', type: 'B', price: 150, sizes: ['S'], code: 'CODEBLUE' },
  ],
}


describe('Price label UI', () => {
  it('shows per-piece and full-set price on Collection listing', () => {
    render(
      <ShopContext.Provider value={{ products: [mockProduct], search: '', showSearch: false }}>
        <MemoryRouter>
          <Collection />
        </MemoryRouter>
      </ShopContext.Provider>
    )

    expect(screen.getByText(/\(Full Set\)/i)).toBeInTheDocument()
    expect(screen.getByText(/\/pc/i)).toBeInTheDocument()
  })

  it('shows Set and per-piece on Product page with correct computed values', () => {
    render(
      <ShopContext.Provider value={{ products: [mockProduct], currency: '₹', addToCart: () => {}, addToWishlist: () => {}, removeFromWishlist: () => {}, isInWishlist: () => false }}>
        <MemoryRouter initialEntries={[`/product/${mockProduct._id}`]}>
          <Routes>
            <Route path="/product/:productId" element={<Product />} />
          </Routes>
        </MemoryRouter>
      </ShopContext.Provider>
    )

    // per-piece shown should equal variant.price
    expect(screen.getByText(/₹200/)).toBeInTheDocument()
    // set price equals price * number of sizes (2 * 200 = 400)
    expect(screen.getByText(/₹400/)).toBeInTheDocument()
    expect(screen.getByText(/Per piece/i)).toBeInTheDocument()
  })

  it('renders variant buttons with both color and type and updates selection', () => {
    render(
      <ShopContext.Provider value={{ products: [mockProduct], currency: '₹', addToCart: () => {}, addToWishlist: () => {}, removeFromWishlist: () => {}, isInWishlist: () => false }}>
        <MemoryRouter initialEntries={[`/product/${mockProduct._id}`]}>
          <Routes>
            <Route path="/product/:productId" element={<Product />} />
          </Routes>
        </MemoryRouter>
      </ShopContext.Provider>
    )

    // there should be two variant buttons containing both pieces of info
    const buttons = screen.getAllByRole('button', { name: /Red/i });
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Red \/ A/)).toBeInTheDocument();
    expect(screen.getByText(/Blue \/ B/)).toBeInTheDocument();

    // clicking second variant should change the displayed type label
    fireEvent.click(screen.getByText(/Blue \/ B/));
    expect(screen.getByText(/Type:\s*B/)).toBeInTheDocument();
  })

  it('handles composite-key cart entries correctly and shows separate variants', () => {
    // two different variant entries should be treated separately
    const cartItems = {
      'p1::Red::A': { quantity: 1, color: 'Red', type: 'A' },
      'p1::Blue::B': { quantity: 2, color: 'Blue', type: 'B' },
    };

    // compute expected subtotal for the cart using pack prices
    const getCartAmount = () => {
      const v1 = mockProduct.variants.find((v) => v.color === 'Red' && v.type === 'A');
      const v2 = mockProduct.variants.find((v) => v.color === 'Blue' && v.type === 'B');
      const qty1 = Number(cartItems['p1::Red::A'].quantity || 0);
      const qty2 = Number(cartItems['p1::Blue::B'].quantity || 0);
      const pack1 = v1.price * (v1.sizes?.length || 1);
      const pack2 = v2.price * (v2.sizes?.length || 1);
      return pack1 * qty1 + pack2 * qty2;
    };

    render(
      <ShopContext.Provider value={{ products: [mockProduct], cartItems, currency: '₹', updateQuantity: () => {}, navigate: () => {}, getCartAmount }}>
        <MemoryRouter>
          <Cart />
        </MemoryRouter>
      </ShopContext.Provider>
    )

    // per-piece breakdown should appear
    expect(screen.getAllByText(/\(Per pc\)/i).length).toBe(2);
    // codes for each variant should be visible
    expect(screen.getByText(/CODE123/)).toBeInTheDocument();
    expect(screen.getByText(/CODEBLUE/)).toBeInTheDocument();
    // total should equal combined pack price
    const expectedTotal = getCartAmount();
    expect(screen.getByText(new RegExp(`₹${expectedTotal}`))).toBeInTheDocument();
  })
})
