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

export type Banner = {
  id: number;
  title: string;
  image: string;
  position: string;
  isActive: boolean;
  order: number;
};

export function createColumns(onDelete: (id: number, title: string) => void): ColumnDef<Banner>[] {
  return [
    {
      accessorKey: "image",
      header: "Gorsel",
      cell: ({ row }) => (
        <div className="relative w-24 h-12 rounded overflow-hidden bg-muted">
          <img
            src={row.original.image}
            alt={row.original.title}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Baslik",
    },
    {
      accessorKey: "position",
      header: "Pozisyon",
      cell: ({ row }) => <Badge variant="outline">{row.original.position}</Badge>,
    },
    {
      accessorKey: "order",
      header: "Sira",
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
      id: "actions",
      cell: ({ row }) => {
        const banner = row.original;
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
                <Link href={`/admin/bannerlar/${banner.id}`} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Duzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => onDelete(banner.id, banner.title)}
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
