"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  parent?: { id: number; name: string } | null;
  _count?: { products: number; children: number };
};

export function createColumns(onDelete: (id: number, name: string) => void): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "image",
      header: "Gorsel",
      cell: ({ row }) => {
        const image = row.original.image;
        return (
          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
            {image ? (
              <img src={image} alt={row.original.name} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">Yok</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Kategori Adi",
    },
    {
      accessorKey: "parent.name",
      header: "Ust Kategori",
      cell: ({ row }) => row.original.parent?.name || "-",
    },
    {
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.products",
      header: "Urun Sayisi",
      cell: ({ row }) => row.original._count?.products || 0,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Islemler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/kategoriler/${category.id}`} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Duzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(category.id, category.name)}
              >
                <Trash className="mr-2 h-4 w-4" /> Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
