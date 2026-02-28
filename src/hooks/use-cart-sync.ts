"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/store/use-cart-store";

/**
 * Kullanıcı giriş yaptığında Zustand sepetini DB ile senkronize eder.
 *
 * - Zustand'daki local item'ları DB'ye yazar (merge)
 * - DB'deki item'ları Zustand'a çeker (başka cihazdan eklenenler dahil)
 * - Çıkış yapınca Zustand'ı temizler
 */
export function useCartSync() {
  const { data: session, isPending } = useSession();
  const { items, clearCart } = useCartStore();

  // Önceki userId'yi sakla → değişince sync yap
  const prevUserIdRef = useRef<string | null>(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isPending) return;

    const userId = session?.user?.id ?? null;

    // Çıkış yapıldı → Zustand'ı temizle
    if (prevUserIdRef.current && !userId) {
      clearCart();
      syncedRef.current = false;
      prevUserIdRef.current = null;
      return;
    }

    // Giriş yapıldı veya sayfa yenilemede session varsa sync yap (bir kez)
    if (userId && !syncedRef.current) {
      syncedRef.current = true;
      prevUserIdRef.current = userId;
      syncCart(items);
    }
    // bilinçli olarak items dependency'ye eklemiyoruz:
    // sync sadece login anında yapılmalı, her item değişiminde değil
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, isPending]);

  async function syncCart(localItems: typeof items) {
    try {
      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: localItems.map((i) => ({
            productId: Number(i.id),
            variantId: i.variantId ? Number(i.variantId) : null,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      const dbItems: typeof items = data.data;

      if (!Array.isArray(dbItems) || dbItems.length === 0) return;

      // DB'den gelen item'larla Zustand'ı tamamen güncelle
      // (addItem yerine doğrudan state set edilmesi için store'a replaceItems eklenmiş olabilir)
      // replaceItems yoksa mevcut store metodunu kullanarak reset uygula
      const store = useCartStore.getState();
      store.clearCart();
      for (const item of dbItems) {
        store.addItem({
          id: item.id,
          variantId: item.variantId,
          name: item.name,
          slug: item.slug,
          price: item.price,
          image: item.image,
          category: item.category,
        });
        // addItem her seferinde 1 ekler; quantity için updateQuantity çağır
        if (item.quantity > 1) {
          store.updateQuantity(item.id, item.quantity, item.variantId);
        }
      }
    } catch {
      // Sessizce geç — Zustand'daki mevcut sepet korunur
    }
  }
}
