export interface ActiveDiscount {
  id: number;
  name: string;
  value: number;
  type: string;
  categoryId?: number | null;
}

export interface ProductPricing {
  effectivePrice: number;
  originalPrice: number | null;
  discountPercent: number;
  isOnSale: boolean;
  extraDiscount: ActiveDiscount | null;
}

interface PricingInput {
  price: number;
  comparePrice?: number | null;
}

export function getProductPricing(
  product: PricingInput,
  applicableDiscounts: ActiveDiscount[] = [],
): ProductPricing {
  let effectivePrice = product.price;
  let originalPrice: number | null = null;

  if (product.comparePrice != null && product.comparePrice > product.price) {
    effectivePrice = product.price;
    originalPrice = product.comparePrice;
  }

  let extraDiscount: ActiveDiscount | null = null;

  if (applicableDiscounts.length > 0) {
    extraDiscount = applicableDiscounts[0];
    const priceBeforeBulk = effectivePrice;
    effectivePrice = Math.round(effectivePrice * (1 - extraDiscount.value / 100));

    // If no comparePrice, set originalPrice to the base price so strikethrough shows
    if (originalPrice === null) {
      originalPrice = priceBeforeBulk;
    }
  }

  const baseForPercent = originalPrice ?? product.price;
  const discountPercent =
    baseForPercent > effectivePrice
      ? Math.round((1 - effectivePrice / baseForPercent) * 100)
      : 0;

  return {
    effectivePrice,
    originalPrice,
    discountPercent,
    isOnSale: originalPrice !== null,
    extraDiscount,
  };
}
