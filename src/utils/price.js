// Price helper utilities for per-piece and pack pricing
// Business rule: Holeshell sells products as a set/combo (all sizes in one pack).
// - Product listings and collection pages should show "per-piece" price (derived from pack / pieces)
// - Cart and checkout must use the pack price (full-set price) and add the full pack as the item
// These helpers make that explicit: use `getPerPiecePrice` for UI display and `getPackPrice` when adding to cart.
export function getPackPriceFromVariant(variant) {
  // price field is now per-piece cost; total pack price = per-piece * number of pieces
  const perPiece = Number(variant?.price || 0);
  const pieces = getPiecesFromVariant(variant);
  return perPiece * pieces;
}

export function getPiecesFromVariant(variant) {
  return Math.max(Number(variant?.sizes?.length || 1), 1);
}

export function getPerPiecePriceFromVariant(variant) {
  // variant price stored as per-piece directly
  return Number(variant?.price || 0);
}

export function getPerPiecePrice(product) {
  const v = product?.variants?.[0];
  return getPerPiecePriceFromVariant(v);
}

export function getPerPieceRange(product) {
  const variants = product?.variants || [];
  if (!variants.length) return { min: 0, max: 0 };
  const prices = variants.map((v) => getPerPiecePriceFromVariant(v));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getPackPrice(product) {
  const v = product?.variants?.[0];
  return getPackPriceFromVariant(v);
}
// Formatting helper (round to nearest integer and locale format)
export function formatNumber(n) {
  return Math.round(n).toLocaleString();
}
