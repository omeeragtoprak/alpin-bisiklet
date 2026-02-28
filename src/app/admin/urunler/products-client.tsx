"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Loader2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { ProductsSearchInput } from "./products-search-input";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableViewOptions } from "@/components/ui/data-table/data-table-view-options";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { useAdminMutation } from "@/hooks/use-admin-mutation";
import { useCategoryOptions } from "@/hooks/queries/use-categories";
import { useBrands } from "@/hooks/queries/use-brands";
import { useDebounce } from "@/hooks/use-debounce";
import { QUERY_KEYS } from "@/constants/query-keys";
import { createColumns, type Product } from "./columns";

// ─── Tipler ────────────────────────────────────────────────────────────────

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsData {
  data: Product[];
  meta: Meta;
}

// ─── Sıralama yardımcıları ─────────────────────────────────────────────────

const SORTING_TO_ORDER_BY: Record<string, string> = {
  "price-asc": "price:asc",
  "price-desc": "price:desc",
  "name-asc": "name:asc",
  "name-desc": "name:desc",
  "stock-asc": "stock:asc",
  "stock-desc": "stock:desc",
};

function orderByToSorting(orderBy: string): SortingState {
  const map: Record<string, SortingState> = {
    "price:asc": [{ id: "price", desc: false }],
    "price:desc": [{ id: "price", desc: true }],
    "name:asc": [{ id: "name", desc: false }],
    "name:desc": [{ id: "name", desc: true }],
    "stock:asc": [{ id: "stock", desc: false }],
    "stock:desc": [{ id: "stock", desc: true }],
  };
  return map[orderBy] ?? [];
}

function sortingToOrderBy(sorting: SortingState): string {
  if (!sorting.length) return "createdAt:desc";
  const { id, desc } = sorting[0];
  const key = `${id}-${desc ? "desc" : "asc"}`;
  return SORTING_TO_ORDER_BY[key] ?? "createdAt:desc";
}

// ─── URL param yönetimi ────────────────────────────────────────────────────

function parseParams(searchParams: URLSearchParams) {
  return {
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined,
    brandId: searchParams.get("brandId")
      ? Number(searchParams.get("brandId"))
      : undefined,
    isActive: searchParams.get("isActive") || "all",
    inStock: searchParams.get("inStock") === "true",
    isFeatured: searchParams.get("isFeatured") === "true",
    hasDiscount: searchParams.get("hasDiscount") === "true",
    isNew: searchParams.get("isNew") === "true",
    orderBy: searchParams.get("orderBy") || "createdAt:desc",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  };
}

// ─── Ana component ─────────────────────────────────────────────────────────

export function ProductsClient({ initialData }: { initialData: ProductsData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseParams(searchParams), [searchParams]);

  // Arama inputu local state (debounce için)
  const [searchInput, setSearchInput] = useState(params.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // URL'i güncelleme (filter değişince sayfa 1'e döner)
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all" || value === "false") {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      }
      router.replace(`/admin/urunler?${current.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Debounced search → URL (min 3 karakter veya boş)
  useEffect(() => {
    if (debouncedSearch.length > 0 && debouncedSearch.length < 3) return;
    const urlSearch = searchParams.get("search") || "";
    if (debouncedSearch === urlSearch) return;
    updateParams({ search: debouncedSearch || undefined, page: "1" });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL search değişince input'u senkronize et
  useEffect(() => {
    setSearchInput(params.search);
  }, [params.search]);

  // ─── TanStack Query ────────────────────────────────────────────────────

  const queryKey = QUERY_KEYS.products.list({
    ...params,
    isActive: params.isActive,
  });

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("page", String(params.page));
      qs.set("limit", String(params.limit));
      qs.set("isActive", params.isActive); // her zaman gönder (admin için "all")
      if (params.search) qs.set("search", params.search);
      if (params.categoryId) qs.set("categoryId", String(params.categoryId));
      if (params.brandId) qs.set("brandId", String(params.brandId));
      if (params.inStock) qs.set("inStock", "true");
      if (params.isFeatured) qs.set("isFeatured", "true");
      if (params.hasDiscount) qs.set("hasDiscount", "true");
      if (params.isNew) qs.set("isNew", "true");
      if (params.orderBy !== "createdAt:desc")
        qs.set("orderBy", params.orderBy);
      if (params.minPrice) qs.set("minPrice", String(params.minPrice));
      if (params.maxPrice) qs.set("maxPrice", String(params.maxPrice));
      const res = await fetch(`/api/products?${qs}`);
      if (!res.ok) throw new Error("Ürünler getirilemedi");
      return res.json() as Promise<ProductsData>;
    },
    initialData,
    placeholderData: keepPreviousData,
  });

  const products = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 };

  // ─── Tablo state ───────────────────────────────────────────────────────

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const sorting = useMemo(
    () => orderByToSorting(params.orderBy),
    [params.orderBy],
  );

  const pagination = useMemo(
    () => ({ pageIndex: params.page - 1, pageSize: params.limit }),
    [params.page, params.limit],
  );

  const columns = useMemo(
    () => createColumns((id, name) => setDeleteTarget({ id, name })),
    [],
  );

  const table = useReactTable({
    data: products,
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount: meta.totalPages,
    state: { sorting, pagination, columnVisibility, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      updateParams({ orderBy: sortingToOrderBy(newSorting), page: "1" });
    },
    onPaginationChange: (updater) => {
      const newPag =
        typeof updater === "function" ? updater(pagination) : updater;
      const updates: Record<string, string | undefined> = {};
      if (newPag.pageIndex !== pagination.pageIndex) {
        updates.page = String(newPag.pageIndex + 1);
      }
      if (newPag.pageSize !== pagination.pageSize) {
        updates.limit = String(newPag.pageSize);
        updates.page = "1";
      }
      updateParams(updates);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // ─── Filter dropdowns için veri ───────────────────────────────────────

  const { data: categoryOptions } = useCategoryOptions();
  const { data: brands } = useBrands();

  // ─── Delete mutation ───────────────────────────────────────────────────

  const deleteMutation = useAdminMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ürün silinemedi");
      return res.json();
    },
    invalidateKeys: [QUERY_KEYS.products.lists() as unknown as string[]],
    successMessage: "Ürün silindi",
    errorMessage: "Ürün silinirken hata oluştu",
    onSuccess: () => setDeleteTarget(null),
  });

  // ─── Aktif filtre sayısı ───────────────────────────────────────────────

  const activeFilterCount = [
    params.search,
    params.categoryId,
    params.brandId,
    params.isActive !== "all" ? params.isActive : null,
    params.inStock,
    params.isFeatured,
    params.hasDiscount,
    params.isNew,
    params.minPrice,
    params.maxPrice,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchInput("");
    router.replace("/admin/urunler", { scroll: false });
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <PageHeader title="Ürünler" description="Tüm ürünleri yönetin">
        <Button variant="outline" asChild>
          <Link href="/admin/urunler/import">
            <Upload className="mr-2 h-4 w-4" />
            Toplu Yükle
          </Link>
        </Button>
        <Button asChild>
          <Link href="/admin/urunler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Link>
        </Button>
      </PageHeader>

      {/* Filtre Paneli */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        {/* Birinci satır: arama + filtreler */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Arama */}
          <ProductsSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={(q) => {
              setSearchInput(q);
              updateParams({ search: q || undefined, page: "1" });
            }}
          />

          {/* Kategori */}
          <Select
            value={params.categoryId ? String(params.categoryId) : "all"}
            onValueChange={(v) =>
              updateParams({
                categoryId: v === "all" ? undefined : v,
                page: "1",
              })
            }
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categoryOptions?.map((cat) => (
                <SelectItem key={cat.value} value={String(cat.value)}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Marka */}
          <Select
            value={params.brandId ? String(params.brandId) : "all"}
            onValueChange={(v) =>
              updateParams({
                brandId: v === "all" ? undefined : v,
                page: "1",
              })
            }
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Marka" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Markalar</SelectItem>
              {brands?.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Durum */}
          <div className="flex rounded-md border overflow-hidden h-9">
            {(
              [
                { value: "all", label: "Tümü" },
                { value: "true", label: "Aktif" },
                { value: "false", label: "Pasif" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  updateParams({ isActive: value, page: "1" })
                }
                className={`px-3 text-sm transition-colors ${
                  params.isActive === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Ek Filtreler Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Daha Fazla
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4" align="start">
              <p className="text-sm font-medium">Ek Filtreler</p>

              {(
                [
                  { key: "inStock", label: "Stokta Var" },
                  { key: "isFeatured", label: "Öne Çıkan" },
                  { key: "hasDiscount", label: "İndirimli" },
                  { key: "isNew", label: "Yeni" },
                ] as const
              ).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={params[key]}
                    onCheckedChange={(checked) =>
                      updateParams({
                        [key]: checked ? "true" : undefined,
                        page: "1",
                      })
                    }
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}

              {/* Fiyat Aralığı */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Fiyat Aralığı (₺)
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-8 text-sm"
                    value={params.minPrice ?? ""}
                    onChange={(e) =>
                      updateParams({
                        minPrice: e.target.value || undefined,
                        page: "1",
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-8 text-sm"
                    value={params.maxPrice ?? ""}
                    onChange={(e) =>
                      updateParams({
                        maxPrice: e.target.value || undefined,
                        page: "1",
                      })
                    }
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sıralama */}
          <Select
            value={params.orderBy}
            onValueChange={(v) => updateParams({ orderBy: v, page: "1" })}
          >
            <SelectTrigger className="h-9 w-[175px]">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">En Yeni</SelectItem>
              <SelectItem value="createdAt:asc">En Eski</SelectItem>
              <SelectItem value="price:asc">Fiyat (Düşük → Yüksek)</SelectItem>
              <SelectItem value="price:desc">Fiyat (Yüksek → Düşük)</SelectItem>
              <SelectItem value="name:asc">İsim (A → Z)</SelectItem>
              <SelectItem value="name:desc">İsim (Z → A)</SelectItem>
              <SelectItem value="stock:asc">Stok (Az → Çok)</SelectItem>
              <SelectItem value="stock:desc">Stok (Çok → Az)</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre temizle */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={clearAllFilters}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Temizle
            </Button>
          )}

          {/* Column visibility */}
          <div className="ml-auto">
            <DataTableViewOptions table={table} />
          </div>
        </div>

        {/* Aktif filtre etiketleri */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {params.search && (
              <FilterChip
                label={`"${params.search}"`}
                onRemove={() => {
                  setSearchInput("");
                  updateParams({ search: undefined, page: "1" });
                }}
              />
            )}
            {params.categoryId && categoryOptions && (
              <FilterChip
                label={
                  categoryOptions.find((c) => c.value === params.categoryId)
                    ?.label ?? "Kategori"
                }
                onRemove={() =>
                  updateParams({ categoryId: undefined, page: "1" })
                }
              />
            )}
            {params.brandId && brands && (
              <FilterChip
                label={
                  brands.find((b) => b.id === params.brandId)?.name ?? "Marka"
                }
                onRemove={() =>
                  updateParams({ brandId: undefined, page: "1" })
                }
              />
            )}
            {params.isActive === "true" && (
              <FilterChip
                label="Aktif"
                onRemove={() => updateParams({ isActive: "all", page: "1" })}
              />
            )}
            {params.isActive === "false" && (
              <FilterChip
                label="Pasif"
                onRemove={() => updateParams({ isActive: "all", page: "1" })}
              />
            )}
            {params.inStock && (
              <FilterChip
                label="Stokta Var"
                onRemove={() => updateParams({ inStock: undefined, page: "1" })}
              />
            )}
            {params.isFeatured && (
              <FilterChip
                label="Öne Çıkan"
                onRemove={() =>
                  updateParams({ isFeatured: undefined, page: "1" })
                }
              />
            )}
            {params.hasDiscount && (
              <FilterChip
                label="İndirimli"
                onRemove={() =>
                  updateParams({ hasDiscount: undefined, page: "1" })
                }
              />
            )}
            {params.isNew && (
              <FilterChip
                label="Yeni"
                onRemove={() => updateParams({ isNew: undefined, page: "1" })}
              />
            )}
            {(params.minPrice || params.maxPrice) && (
              <FilterChip
                label={`₺${params.minPrice ?? "0"} — ₺${params.maxPrice ?? "∞"}`}
                onRemove={() =>
                  updateParams({
                    minPrice: undefined,
                    maxPrice: undefined,
                    page: "1",
                  })
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Tablo */}
      {products.length === 0 && !isFetching ? (
        <EmptyState
          title="Ürün bulunamadı"
          description={
            activeFilterCount > 0
              ? "Filtrelerinize uygun ürün yok. Filtreleri temizleyerek tekrar deneyin."
              : "İlk ürününü ekleyerek başlayabilirsin"
          }
          actionLabel={activeFilterCount > 0 ? undefined : "Yeni Ürün Ekle"}
          actionHref={
            activeFilterCount > 0 ? undefined : "/admin/urunler/yeni"
          }
        />
      ) : (
        <div className="rounded-lg border bg-card">
          {/* Tablo + loading overlay */}
          <div className="relative overflow-hidden rounded-t-lg">
            {isFetching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="border-t p-3">
            <AdminPagination
              page={params.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={params.limit}
              selectedCount={table.getFilteredSelectedRowModel().rows.length}
              onPageChange={(p) => updateParams({ page: String(p) })}
              onLimitChange={(l) =>
                updateParams({ limit: String(l), page: "1" })
              }
            />
          </div>
        </div>
      )}

      {/* Silme onayı */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Ürünü Sil"
        description={`"${deleteTarget?.name}" ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate(deleteTarget.id)
        }
      />
    </div>
  );
}

// ─── Alt bileşenler ────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  selectedCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function AdminPagination({
  page,
  totalPages,
  total,
  limit,
  selectedCount,
  onPageChange,
  onLimitChange,
}: AdminPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
      {/* Sol: seçili + toplam */}
      <div className="text-muted-foreground">
        {selectedCount > 0 && (
          <span className="mr-3 font-medium text-foreground">
            {selectedCount} seçili
          </span>
        )}
        Toplam{" "}
        <span className="font-medium text-foreground">{total}</span> ürün
      </div>

      {/* Orta: sayfa boyutu */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground whitespace-nowrap">
          Sayfa başına
        </span>
        <Select
          value={String(limit)}
          onValueChange={(v) => onLimitChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sağ: sayfa navigasyonu */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-3 text-sm">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
