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
  it('computes per-piece price from variant (stored directly)', () => {
    const v = { price: 100, sizes: ["S", "M", "L", "XL"] };
    expect(getPerPiecePriceFromVariant(v)).toBe(100);
  })

  it('defaults pieces to 1 when sizes missing', () => {
    const v = { price: 50 };
    expect(getPiecesFromVariant(v)).toBe(1);
    expect(getPerPiecePriceFromVariant(v)).toBe(50);
  })

  it('computes per-piece price from product (first variant)', () => {
    const p = { variants: [{ price: 120, sizes: [1,2,3,4]}] };
    expect(getPerPiecePrice(p)).toBe(120);
  })

  it('computes min/max per-piece across variants', () => {
    // price field is stored as per-piece cost; range should consider value directly
    const p = { variants: [{ price: 100, sizes: [1] }, { price: 90, sizes: [1,2,3] }] };
    // per-piece values are 100 and 90 -> min 90, max 100
    const r = getPerPieceRange(p);
    expect(r.min).toBe(90);
    expect(r.max).toBe(100);
  })

  it('formats numbers correctly', () => {
    expect(formatNumber(1234.6)).toBe('1,235');
  })

  it('pack price helpers multiply piece cost by count', () => {
    const v = { price: 250, sizes: ["S","M"] };
    // per-piece 250, two pieces = pack 500
    expect(getPackPriceFromVariant(v)).toBe(500);
    expect(getPackPrice({ variants: [v] })).toBe(500);
  })
})
