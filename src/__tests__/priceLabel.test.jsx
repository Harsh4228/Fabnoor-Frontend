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
    { color: 'Red', type: 'A', price: 200, sizes: ['S', 'M'] },
  ],
}

describe('Price label UI', () => {
  it('shows Set and per-piece on Collection listing', () => {
    render(
      <ShopContext.Provider value={{ products: [mockProduct], search: '', showSearch: false }}>
        <MemoryRouter>
          <Collection />
        </MemoryRouter>
      </ShopContext.Provider>
    )

    expect(screen.getByText(/\(Set\)/i)).toBeInTheDocument()
    expect(screen.getByText(/\/pc/i)).toBeInTheDocument()
  })

  it('shows Set and per-piece on Product page', () => {
    render(
      <ShopContext.Provider value={{ products: [mockProduct], currency: '₹', addToCart: () => {}, addToWishlist: () => {}, removeFromWishlist: () => {}, isInWishlist: () => false }}>
        <MemoryRouter initialEntries={[`/product/${mockProduct._id}`]}>
          <Routes>
            <Route path="/product/:productId" element={<Product />} />
          </Routes>
        </MemoryRouter>
      </ShopContext.Provider>
    )

    expect(screen.getByText(/Set price:/i)).toBeInTheDocument()
    expect(screen.getByText(/Per piece/i)).toBeInTheDocument()
  })

  it('shows Set and per-piece in Cart line item and totals formatted', () => {
    const cartItems = { p1: { quantity: 1, color: 'Red', type: 'A' } }

    // compute simple subtotal for the cart
    const getCartAmount = () => {
      const v = mockProduct.variants[0];
      const qty = Number(cartItems.p1.quantity || 0);
      return v.price * qty;
    };

    render(
      <ShopContext.Provider value={{ products: [mockProduct], cartItems, currency: '₹', updateQuantity: () => {}, navigate: () => {}, getCartAmount }}>
        <MemoryRouter>
          <Cart />
        </MemoryRouter>
      </ShopContext.Provider>
    )

    // Set indicator and per-piece breakdown
    expect(screen.getByText(/\(Set\)/i)).toBeInTheDocument()
    expect(screen.getAllByText(/\/pc/i).length).toBeGreaterThan(0)
  })
})
