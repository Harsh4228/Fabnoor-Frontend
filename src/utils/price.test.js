import { describe, it, expect } from 'vitest'
import {
  getPerPiecePriceFromVariant,
  getPerPiecePrice,
  getPerPieceRange,
  getPiecesFromVariant,
  getPackPrice,
  getPackPriceFromVariant,
  formatNumber,
} from './price'

describe('price utilities', () => {
  it('computes per-piece price from variant', () => {
    const v = { price: 100, sizes: ["S", "M", "L", "XL"] };
    expect(getPerPiecePriceFromVariant(v)).toBe(25);
  })

  it('defaults pieces to 1 when sizes missing', () => {
    const v = { price: 50 };
    expect(getPiecesFromVariant(v)).toBe(1);
    expect(getPerPiecePriceFromVariant(v)).toBe(50);
  })

  it('computes per-piece price from product (first variant)', () => {
    const p = { variants: [{ price: 120, sizes: [1,2,3,4]}] };
    expect(getPerPiecePrice(p)).toBe(30);
  })

  it('computes min/max per-piece across variants', () => {
    // Note: sizes should be an array of size entries (one entry per piece)
    const p = { variants: [{ price: 100, sizes: [1] }, { price: 90, sizes: [1,2,3] }] };
    // per-piece: 100/1=100, 90/3=30 -> min 30, max 100
    const r = getPerPieceRange(p);
    expect(r.min).toBe(30);
    expect(r.max).toBe(100);
  })

  it('formats numbers correctly', () => {
    expect(formatNumber(1234.6)).toBe('1,235');
  })

  it('pack price helpers return pack/variant price', () => {
    const v = { price: 250, sizes: ["S","M"] };
    expect(getPackPriceFromVariant(v)).toBe(250);
    expect(getPackPrice({ variants: [v] })).toBe(250);
  })
})
