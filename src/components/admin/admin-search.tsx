"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2, Package, Tag, Grid3X3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchQuery } from "@/hooks/use-search";

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Admin global arama — header'da kullanılan arama kutusu
 * Min 3 karakter sonrası öneri sunar (debounced 350ms)
 */
export function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, isEnabled, debouncedQuery } = useSearchQuery(query);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    open &&
    query.length > 0 &&
    (query.length < 3 || isEnabled);

  const hasResults =
    data &&
    (data.products.length > 0 ||
      data.brands.length > 0 ||
      data.categories.length > 0);

  const goToProductsList = () => {
    if (query.length >= 3) {
      router.push(`/admin/urunler?search=${encodeURIComponent(query)}`);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToProductsList();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Ürün, marka veya kategori ara..."
          className="pl-9 h-9 text-sm"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border bg-popover shadow-xl z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {/* Min karakter uyarısı */}
          {query.length < 3 && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              En az 3 karakter girin...
            </div>
          )}

          {/* Yükleniyor */}
          {isEnabled && isFetching && !data && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aranıyor...
            </div>
          )}

          {/* Sonuç yok */}
          {isEnabled && !isFetching && !hasResults && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              &quot;{debouncedQuery}&quot; için sonuç bulunamadı
            </div>
          )}

          {/* Ürünler */}
          {data && data.products.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b bg-muted/40">
                <Package className="h-3.5 w-3.5" />
                Ürünler
              </div>
              {data.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    router.push(`/admin/urunler/${product.id}`);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {/* Görsel */}
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded object-cover border flex-shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.brand?.name}
                      {product.category?.name && ` · ${product.category.name}`}
                    </p>
                  </div>
                  {/* Fiyat */}
                  <div className="text-sm font-medium flex-shrink-0">
                    {formatPrice(product.price)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Markalar */}
          {data && data.brands.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b bg-muted/40">
                <Tag className="h-3.5 w-3.5" />
                Markalar
              </div>
              {data.brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    router.push(`/admin/urunler?brandId=${brand.id}`);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded object-contain border p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded bg-muted flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {brand.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {brand._count.products} ürün
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Kategoriler */}
          {data && data.categories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b bg-muted/40">
                <Grid3X3 className="h-3.5 w-3.5" />
                Kategoriler
              </div>
              {data.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                  onClick={() => {
                    router.push(`/admin/urunler?categoryId=${cat.id}`);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="h-9 w-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{cat.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Tüm sonuçlara git */}
          {isEnabled && hasResults && (
            <button
              type="button"
              className="w-full px-3 py-2.5 text-sm text-primary hover:bg-accent transition-colors border-t text-left font-medium"
              onClick={goToProductsList}
            >
              &quot;{debouncedQuery}&quot; için tüm ürünleri listele →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
