"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchQuery } from "@/hooks/use-search";

interface ProductsSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Kullanıcı Enter basarsa veya öneri seçerse → filtre uygula */
  onSearch: (query: string) => void;
}

/**
 * Admin ürünler sayfası arama kutusu
 * - Min 3 karakter → backend'e istek → öneri dropdown
 * - Öneri tıklanınca ürün edit sayfasına git
 * - Enter / "Tüm sonuçlar" → filtre uygula (URL güncelle)
 */
export function ProductsSearchInput({
  value,
  onChange,
  onSearch,
}: ProductsSearchInputProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, isEnabled, debouncedQuery } = useSearchQuery(value);

  const hasProducts = data && data.products.length > 0;

  // Dışarı tıklayınca kapat
  useEffect(() => {
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
  }, []);

  const showDropdown = open && value.length > 0;

  const handleSelectProduct = (id: number) => {
    router.push(`/admin/urunler/${id}`);
    setOpen(false);
  };

  const handleApplySearch = () => {
    if (value.length >= 3) {
      onSearch(value);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[220px] max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleApplySearch();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Ürün adı, SKU veya barkod..."
        className="pl-9 pr-8 h-9"
      />

      {/* Sağ: yükleniyor / temizle */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {isFetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onSearch("");
              setOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Karakter progress dots */}
      {value.length > 0 && value.length < 3 && (
        <div className="absolute -bottom-4 left-1 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`inline-block h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                i < value.length ? "bg-primary" : "bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border bg-popover shadow-xl z-50 max-h-80 overflow-y-auto">
          {/* Karakter progress */}
          {value.length < 3 && (
            <div className="flex items-center justify-center gap-2 py-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`inline-block h-2 w-2 rounded-full transition-all duration-200 ${
                    i < value.length
                      ? "bg-primary scale-110"
                      : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Sonuç yok */}
          {isEnabled && !isFetching && !hasProducts && (
            <p className="px-3 py-2.5 text-sm text-muted-foreground text-center">
              &quot;{debouncedQuery}&quot; için ürün bulunamadı
            </p>
          )}

          {/* Ürün önerileri */}
          {hasProducts &&
            data.products.map((product) => (
              <button
                key={product.id}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                onClick={() => handleSelectProduct(product.id)}
              >
                {product.images[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded object-cover border flex-shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {product.brand?.name}
                    {product.category?.name && ` · ${product.category.name}`}
                  </p>
                </div>
                <span className="text-sm font-medium flex-shrink-0 text-muted-foreground">
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </span>
              </button>
            ))}

          {/* Tüm sonuçları filtrele */}
          {isEnabled && hasProducts && (
            <button
              type="button"
              className="w-full px-3 py-2.5 text-sm text-primary font-medium hover:bg-accent transition-colors border-t text-left"
              onClick={handleApplySearch}
            >
              &quot;{debouncedQuery}&quot; için tüm ürünleri göster →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
