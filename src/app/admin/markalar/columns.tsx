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

export type Brand = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  _count?: { products: number };
};

export function createColumns(onDelete: (id: number, name: string) => void): ColumnDef<Brand>[] {
  return [
    {
      accessorKey: "logo",
      header: "Logo",
      cell: ({ row }) => {
        const logo = row.original.logo;
        return (
          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
            {logo ? (
              <img src={logo} alt={row.original.name} className="object-contain w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">Yok</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Marka Adi",
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
        const brand = row.original;
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
                <Link href={`/admin/markalar/${brand.id}`} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Duzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(brand.id, brand.name)}
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
