export interface ProductPricing {
  effectivePrice: number;
  originalPrice: number | null;
  discountPercent: number;
  isOnSale: boolean;
}

interface PricingInput {
  price: number;
  comparePrice?: number | null;
}

export function getProductPricing(product: PricingInput): ProductPricing {
  if (product.comparePrice != null && product.comparePrice > product.price) {
    const discountPercent = Math.round(
      (1 - product.price / product.comparePrice) * 100,
    );
    return {
      effectivePrice: product.price,
      originalPrice: product.comparePrice,
      discountPercent,
      isOnSale: true,
    };
  }

  return {
    effectivePrice: product.price,
    originalPrice: null,
    discountPercent: 0,
    isOnSale: false,
  };
}
