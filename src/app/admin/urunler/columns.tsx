"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export type Product = {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  images: { url: string }[];
  createdAt: string;
};

export function createColumns(onDelete: (id: number, name: string) => void): ColumnDef<Product>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tümünü seç"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Satırı seç"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ürün
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            {product.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="h-10 w-10 rounded object-cover border"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Foto
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[200px]">
                {product.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.brand?.name}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "category.name",
      header: "Kategori",
      id: "category",
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stok
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        const lowStock = row.original.lowStockAlert;
        return (
          <Badge
            variant={stock <= lowStock ? "destructive" : "outline"}
            className={
              stock <= lowStock
                ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                : ""
            }
          >
            {stock}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fiyat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Aktif" : "Pasif"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/urunler/${product.id}`} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Düzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(product.id, product.name)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
