// GA4 e-ticaret event wrapper'ları
// window.gtag layout.tsx'teki script tag ile yüklenir.
// NEXT_PUBLIC_GA_ID tanımlı değilse hiçbir şey yapmaz.

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

export interface AnalyticsItem {
  item_id: string | number;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  price: number;
  quantity?: number;
}

/** Ürün detay sayfası açıldığında */
export function trackViewItem(item: AnalyticsItem) {
  gtag("event", "view_item", {
    currency: "TRY",
    value: item.price,
    items: [item],
  });
}

/** Sepete ekle butonuna basıldığında */
export function trackAddToCart(item: AnalyticsItem) {
  gtag("event", "add_to_cart", {
    currency: "TRY",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

/** Ödeme sayfası açıldığında */
export function trackBeginCheckout(
  items: AnalyticsItem[],
  value: number,
  coupon?: string,
) {
  gtag("event", "begin_checkout", {
    currency: "TRY",
    value,
    coupon,
    items,
  });
}

/** Sipariş başarıyla tamamlandığında */
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping: number;
  coupon?: string;
  items: AnalyticsItem[];
}) {
  gtag("event", "purchase", {
    currency: "TRY",
    transaction_id: params.transactionId,
    value: params.value,
    shipping: params.shipping,
    coupon: params.coupon,
    items: params.items,
  });
}
