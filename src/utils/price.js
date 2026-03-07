export function getDiscountedPrice(price, discount) {
  if (!discount || discount <= 0) return price;
  return price * (1 - discount / 100);
}

export function getPackPriceFromVariant(variant, discount = 0) {
  // price field is now per-piece cost; total pack price = per-piece * number of pieces
  const perPiece = Number(variant?.price || 0);
  const pieces = getPiecesFromVariant(variant);
  const packPrice = perPiece * pieces;
  return getDiscountedPrice(packPrice, discount);
}

export function getPiecesFromVariant(variant) {
  return Math.max(Number(variant?.sizes?.length || 1), 1);
}

export function getPerPiecePriceFromVariant(variant, discount = 0) {
  // variant price stored as per-piece directly
  const price = Number(variant?.price || 0);
  return getDiscountedPrice(price, discount);
}

export function getPerPiecePrice(product, discount = 0) {
  const v = product?.variants?.[0];
  return getPerPiecePriceFromVariant(v, discount);
}

export function getPerPieceRange(product, discount = 0) {
  const variants = product?.variants || [];
  if (!variants.length) return { min: 0, max: 0 };
  const prices = variants.map((v) => getPerPiecePriceFromVariant(v, discount));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getPackPrice(product, discount = 0) {
  const v = product?.variants?.[0];
  return getPackPriceFromVariant(v, discount);
}

// Formatting helper (round to nearest integer and locale format)
export function formatNumber(n) {
  return Math.round(n).toLocaleString();
}
