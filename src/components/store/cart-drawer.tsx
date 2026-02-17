"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart-store";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    getCartTotal
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getCartTotal();
  const shippingThreshold = 500;
  const shippingCost = 29.90;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shipping = isFreeShipping ? 0 : shippingCost;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-[60] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Sepetim</h2>
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Sepeti kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && !isFreeShipping && (
              <div className="bg-primary/5 p-3 text-center text-sm border-b border-primary/10">
                <span className="font-semibold text-primary">
                  {(shippingThreshold - subtotal).toLocaleString("tr-TR")} TL
                </span>
                <span className="text-muted-foreground ml-1">
                  daha ekleyin, kargo <strong>BEDAVA!</strong>
                </span>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(subtotal / shippingThreshold) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {items.length > 0 && isFreeShipping && (
              <div className="bg-green-500/10 text-green-700 p-2 text-center text-sm font-medium border-b border-green-500/20">
                🎉 Harika! Kargo bedava.
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="bg-muted p-6 rounded-full">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Sepetiniz boş</p>
                    <p className="text-muted-foreground text-sm max-w-[200px] mx-auto mt-1">
                      Sepetinizde henüz ürün yok. Alışverişe başlamak için ürünleri keşfedin.
                    </p>
                  </div>
                  <Button onClick={closeCart} asChild className="mt-4">
                    <Link href="/urunler">Alışverişe Başla</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.id}-${item.variantId || 'default'}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-3 bg-muted/30 rounded-lg border hover:border-primary/20 transition-colors group"
                    >
                      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-white shrink-0 border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link href={`/urun/${item.slug}`} className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors" onClick={closeCart}>
                            {item.name}
                          </Link>
                          {item.variantId && (
                            <p className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-1.5 py-0.5 rounded">
                              Varyant ID: {item.variantId}
                            </p>
                          )}
                        </div>

                        <div className="flex items-end justify-between mt-2">
                          <div className="font-semibold text-primary">
                            {item.price.toLocaleString("tr-TR")} TL
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-md bg-background shadow-sm h-8">
                              <button
                                type="button"
                                className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md"
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                                disabled={item.quantity <= 1}
                                aria-label="Azalt"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md"
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                                aria-label="Artır"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                              onClick={() => removeItem(item.id, item.variantId)}
                              aria-label="Kaldır"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t bg-muted/10 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ara Toplam</span>
                    <span className="font-medium">{subtotal.toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className={cn("font-medium", isFreeShipping && "text-green-600")}>
                      {isFreeShipping ? "Ücretsiz" : `${shipping.toLocaleString("tr-TR")} TL`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Toplam</span>
                    <span className="text-primary">
                      {total.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="lg" onClick={closeCart} asChild>
                    <Link href="/sepet">Sepete Git</Link>
                  </Button>
                  <Button size="lg" asChild className="pulsating-button">
                    <Link href="/odeme">Siparişi Tamamla</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
