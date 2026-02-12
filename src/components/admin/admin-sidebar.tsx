"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  Box,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Home,
  Image as ImageIcon,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Ticket,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSidebarStore } from "@/store/use-admin-sidebar-store";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { title: string; href: string }[];
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: Home },
  {
    title: "Urunler",
    icon: Package,
    children: [
      { title: "Tum Urunler", href: "/admin/urunler" },
      { title: "Yeni Urun", href: "/admin/urunler/yeni" },
    ],
  },
  { title: "Kategoriler", href: "/admin/kategoriler", icon: Tags },
  { title: "Markalar", href: "/admin/markalar", icon: Building2 },
  { title: "Siparisler", href: "/admin/siparisler", icon: ShoppingCart },
  { title: "Musteriler", href: "/admin/musteriler", icon: Users },
  { title: "Kuponlar", href: "/admin/kuponlar", icon: Ticket },
  { title: "Bannerlar", href: "/admin/bannerlar", icon: ImageIcon },
  { title: "Sayfalar", href: "/admin/sayfalar", icon: FileText },
  { title: "Barkod", href: "/admin/barkod", icon: Box },
  { title: "Raporlar", href: "/admin/raporlar", icon: BarChart3 },
  { title: "Ayarlar", href: "/admin/ayarlar", icon: Settings },
];

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/giris";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-4 w-4" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-bold whitespace-nowrap">
                Alpin Bisiklet
              </span>
              <span className="block text-[10px] text-muted-foreground">
                Admin Panel
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <NavItemComponent
              key={item.title}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn("border-t p-3 space-y-1", collapsed && "px-2")}>
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Magazaya Git</span>}
        </Link>

        {session && (
          <div className={cn("pt-2 border-t", collapsed && "pt-1")}>
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-3 py-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(session.user.name || session.user.email || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {session.user.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors",
                collapsed && "justify-center px-0",
              )}
              aria-label="Cikis Yap"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Cikis Yap</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItemComponent({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const active = item.href
    ? isActive(pathname, item.href)
    : item.children?.some((c) => isActive(pathname, c.href)) ?? false;

  // Simple item (no children)
  if (!item.children) {
    const linkContent = (
      <Link
        href={item.href!}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
        {!collapsed && item.badge != null && item.badge > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <li>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span>{item.title}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="ml-2 text-destructive font-bold">
                  {item.badge}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return <li>{linkContent}</li>;
  }

  // Collapsible group
  if (collapsed) {
    return (
      <li>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors cursor-default",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="space-y-1 p-2">
            <p className="font-medium text-xs mb-1">{item.title}</p>
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded px-2 py-1 text-sm transition-colors hover:bg-accent",
                  isActive(pathname, child.href) && "font-semibold text-primary",
                )}
              >
                {child.title}
              </Link>
            ))}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return <ExpandableNavItem item={item} pathname={pathname} />;
}

function ExpandableNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const childActive = item.children?.some((c) => isActive(pathname, c.href));
  const isOpen = childActive; // Auto-open when a child is active

  return (
    <li className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          childActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50",
        )}
      >
        <div className="flex items-center gap-2.5">
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-[22px] space-y-0.5 overflow-hidden border-l pl-3"
          >
            {item.children!.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                    isActive(pathname, child.href)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                  )}
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, setMobileOpen, toggleCollapsed } =
    useAdminSidebarStore();

  // Close mobile sheet on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative hidden lg:flex h-full flex-col border-r bg-sidebar overflow-hidden"
      >
        <SidebarContent collapsed={isCollapsed} />

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
          aria-label={isCollapsed ? "Sidebar genislet" : "Sidebar daralt"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </motion.aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
