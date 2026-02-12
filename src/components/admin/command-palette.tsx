"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  Building2,
  FileText,
  Home,
  Image as ImageIcon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Tags,
  Ticket,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CommandItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

const commands: CommandItem[] = [
  { title: "Dashboard", href: "/admin", icon: Home, group: "Sayfalar" },
  { title: "Urunler", href: "/admin/urunler", icon: Package, group: "Sayfalar" },
  { title: "Yeni Urun", href: "/admin/urunler/yeni", icon: Package, group: "Islemler" },
  { title: "Kategoriler", href: "/admin/kategoriler", icon: Tags, group: "Sayfalar" },
  { title: "Markalar", href: "/admin/markalar", icon: Building2, group: "Sayfalar" },
  { title: "Siparisler", href: "/admin/siparisler", icon: ShoppingCart, group: "Sayfalar" },
  { title: "Musteriler", href: "/admin/musteriler", icon: Users, group: "Sayfalar" },
  { title: "Kuponlar", href: "/admin/kuponlar", icon: Ticket, group: "Sayfalar" },
  { title: "Bannerlar", href: "/admin/bannerlar", icon: ImageIcon, group: "Sayfalar" },
  { title: "Sayfalar", href: "/admin/sayfalar", icon: FileText, group: "Sayfalar" },
  { title: "Barkod", href: "/admin/barkod", icon: Box, group: "Sayfalar" },
  { title: "Raporlar", href: "/admin/raporlar", icon: BarChart3, group: "Sayfalar" },
  { title: "Ayarlar", href: "/admin/ayarlar", icon: Settings, group: "Sayfalar" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filtered = query
    ? commands.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {},
  );

  const flatFiltered = Object.values(grouped).flat();

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % flatFiltered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + flatFiltered.length) % flatFiltered.length);
    } else if (e.key === "Enter" && flatFiltered[selectedIndex]) {
      navigate(flatFiltered[selectedIndex].href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Komut Paleti</DialogTitle>
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sayfa veya islem ara..."
            className="flex h-11 w-full rounded-md bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {flatFiltered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sonuc bulunamadi.
            </p>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {group}
              </p>
              {items.map((item) => {
                const globalIdx = flatFiltered.indexOf(item);
                return (
                  <button
                    type="button"
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                      globalIdx === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {item.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
