"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2, Package, Tag, Layers } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

interface StoreSearchProps {
  /** Mobil overlay modu (tam genişlik, autoFocus) */
  mobile?: boolean;
  onClose?: () => void;
  className?: string;
  placeholder?: string;
}

/**
 * Ana site arama — min 3 karakter sonrası öneri dropdown
 * Desktop: inline bar  |  Mobile: overlay ile kullanım
 */
export function StoreSearch({
  mobile = false,
  onClose,
  className = "",
  placeholder = "Bisiklet, marka veya aksesuar ara...",
}: StoreSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(mobile); // mobilde baştan açık
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching, isEnabled, debouncedQuery } = useSearchQuery(
    query,
    { delay: 350, limit: 6 },
  );

  const hasProducts = (data?.products.length ?? 0) > 0;
  const hasBrands = (data?.brands.length ?? 0) > 0;
  const hasCategories = (data?.categories.length ?? 0) > 0;
  const hasResults = hasProducts || hasBrands || hasCategories;

  // Dışarı tıklayınca kapat (desktop)
  useEffect(() => {
    if (mobile) return;
    function handleOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobile]);

  // Mobilde açılınca input'a focus
  useEffect(() => {
    if (mobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mobile]);

  const navigate = (path: string) => {
    router.push(path);
    setQuery("");
    setOpen(false);
    onClose?.();
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/urunler?ara=${encodeURIComponent(query.trim())}`);
    }
  };

  const showDropdown = open && query.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") {
              setOpen(false);
              onClose?.();
            }
          }}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all text-sm pl-10 pr-10 ${
            mobile ? "h-12 text-base" : "h-10"
          }`}
        />
        {/* Sağ: yükleniyor / temizle / kapat */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {!isFetching && query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {mobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-1 text-muted-foreground hover:text-foreground"
              aria-label="Aramayı kapat"
            >
              <X className={`${query ? "h-4 w-4" : "h-5 w-5"}`} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className={`absolute left-0 right-0 mt-2 rounded-xl border bg-background shadow-2xl shadow-black/10 z-[60] overflow-hidden ${
            mobile ? "max-h-[70vh]" : "max-h-[480px]"
          } overflow-y-auto`}
        >
          {/* Karakter progress */}
          {query.length < 3 && (
            <div className="flex items-center justify-center gap-2 py-5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`inline-block rounded-full transition-all duration-200 ${
                    i < query.length
                      ? "h-2.5 w-2.5 bg-primary scale-110"
                      : "h-2 w-2 bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Yükleniyor */}
          {isEnabled && isFetching && !data && (
            <div className="px-4 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aranıyor...
            </div>
          )}

          {/* Sonuç yok */}
          {isEnabled && !isFetching && !hasResults && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium">Sonuç bulunamadı</p>
              <p className="text-xs text-muted-foreground mt-1">
                &ldquo;{debouncedQuery}&rdquo; için ürün bulunamadı
              </p>
            </div>
          )}

          {/* Ürünler */}
          {hasProducts && (
            <section>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b bg-muted/30">
                <Package className="h-3 w-3" />
                Ürünler
              </div>
              {data!.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left group"
                  onClick={() => navigate(`/urunler/${product.slug}`)}
                >
                  {/* Görsel */}
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-lg object-cover border flex-shrink-0"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.brand?.name}
                      {product.category?.name &&
                        ` · ${product.category.name}`}
                    </p>
                  </div>

                  {/* Fiyat */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(product.price)}
                    </p>
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.comparePrice)}
                        </p>
                      )}
                  </div>
                </button>
              ))}
            </section>
          )}

          {/* Markalar */}
          {hasBrands && (
            <section>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b bg-muted/30">
                <Tag className="h-3 w-3" />
                Markalar
              </div>
              <div>
                {data!.brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                    onClick={() =>
                      navigate(`/urunler?markalar=${brand.id}`)
                    }
                  >
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded object-contain border p-0.5 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded bg-muted flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {brand.name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {brand.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {brand._count.products} ürün
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Kategoriler */}
          {hasCategories && (
            <section>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b bg-muted/30">
                <Layers className="h-3 w-3" />
                Kategoriler
              </div>
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {data!.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      navigate(`/urunler?kategoriler=${cat.slug}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tüm sonuçlara git */}
          {isEnabled && hasResults && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 transition-colors border-t"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              &ldquo;{debouncedQuery}&rdquo; için tüm sonuçları gör
            </button>
          )}
        </div>
      )}
    </div>
  );
}
