"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Ticket,
  Users,
  Home,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string }[];
}

const navMain: NavItem[] = [
  { title: "Panel", url: "/admin", icon: Home },
  {
    title: "Ürünler",
    icon: Package,
    items: [
      { title: "Tüm Ürünler", url: "/admin/urunler" },
      { title: "Yeni Ürün", url: "/admin/urunler/yeni" },
    ],
  },
  { title: "Kategoriler", url: "/admin/kategoriler", icon: Tags },
  { title: "Markalar", url: "/admin/markalar", icon: Building2 },
  { title: "Siparişler", url: "/admin/siparisler", icon: ShoppingCart },
  { title: "Müşteriler", url: "/admin/musteriler", icon: Users },
  { title: "Kuponlar", url: "/admin/kuponlar", icon: Ticket },
  { title: "Bannerlar", url: "/admin/bannerlar", icon: ImageIcon },
  { title: "Sayfalar", url: "/admin/sayfalar", icon: FileText },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Barkod", url: "/admin/barkod", icon: Box },
  { title: "Raporlar", url: "/admin/raporlar", icon: BarChart3 },
  { title: "Ayarlar", url: "/admin/ayarlar", icon: Settings },
];

// Ana menü öğeleri için: /admin hariç startsWith kullan
function isActive(pathname: string, url?: string) {
  if (!url) return false;
  if (url === "/admin") return pathname === "/admin";
  return pathname.startsWith(url);
}

// Alt menü öğeleri için: tam eşleşme (iki sayfa aynı anda aktif olmasın)
function isSubItemActive(pathname: string, url: string) {
  return pathname === url;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "",
    initials: (session?.user?.name || session?.user?.email || "A")
      .charAt(0)
      .toUpperCase(),
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header — Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Alpin Bisiklet</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Yönetim Paneli
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {navMain.map((item) => {
              if (!item.items) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(pathname, item.url)}
                    >
                      <Link href={item.url!}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              const groupActive = item.items.some((sub) =>
                isActive(pathname, sub.url),
              );

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={groupActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Aç/Kapat</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubItemActive(pathname, subItem.url)}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — Mağaza linki + Kullanıcı */}
      <SidebarFooter>
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Mağazaya Git">
              <Link href="/" target="_blank">
                <ExternalLink className="size-4" />
                <span>Mağazaya Git</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/ayarlar" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" target="_blank" className="cursor-pointer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mağazaya Git
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
