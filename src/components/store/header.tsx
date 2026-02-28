"use client";

import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Mountain,
  Package,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StoreSearch } from "@/components/store/store-search";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartSync } from "@/hooks/use-cart-sync";
import { signOut, useSession } from "@/lib/auth-client";
import { useCartStore } from "@/store/use-cart-store";

const navigation = [
  { name: "Ana Sayfa", href: "/" },
  {
    name: "Bisikletler",
    href: "/urunler?tip=BICYCLE",
    children: [
      {
        name: "Dağ Bisikleti",
        href: "/urunler?tip=BICYCLE&kategoriler=dag-bisikleti",
      },
      {
        name: "Yol Bisikleti",
        href: "/urunler?tip=BICYCLE&kategoriler=yol-bisikleti",
      },
      {
        name: "Şehir Bisikleti",
        href: "/urunler?tip=BICYCLE&kategoriler=sehir-bisikleti",
      },
      {
        name: "Çocuk Bisikleti",
        href: "/urunler?tip=BICYCLE&kategoriler=cocuk-bisikleti",
      },
      {
        name: "Elektrikli Bisiklet",
        href: "/urunler?tip=BICYCLE&kategoriler=elektrikli-bisiklet",
      },
    ],
  },
  {
    name: "Aksesuarlar",
    href: "/urunler?tip=GENERAL",
    children: [
      { name: "Kask", href: "/urunler?tip=GENERAL&kategoriler=kask" },
      {
        name: "Aydınlatma",
        href: "/urunler?tip=GENERAL&kategoriler=aydinlatma",
      },
    ],
  },
  { name: "Yedek Parça", href: "/urunler?tip=GENERAL&kategoriler=yedek-parca" },
  { name: "Markalar", href: "/markalar" },
  { name: "Blog", href: "/blog" },
  { name: "İletişim", href: "/iletisim" },
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getCartCount, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as any;
  const router = useRouter();

  // Login/logout'ta Zustand ↔ DB senkronizasyonu
  useCartSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    useCartStore.getState().clearCart();
    await signOut();
    router.refresh();
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border/50"
          : "bg-background/95 backdrop-blur border-b"
          }`}
      >
        {/* Top bar — hides on scroll */}
        <motion.div
          className="bg-gradient-to-r from-primary via-primary/95 to-primary py-2 overflow-hidden text-primary-foreground text-xs"
          animate={{
            height: scrolled ? 0 : "auto",
            opacity: scrolled ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mx-auto px-4 container min-w-0">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <span className="inline-block bg-primary-foreground/50 rounded-full w-1.5 h-1.5 animate-pulse shrink-0" />
              <p className="font-medium truncate min-w-0">Ücretsiz kargo 500 TL ve üzeri siparişlerde!</p>
            </div>
            <div className="hidden md:flex items-center gap-4 shrink-0">
              <Link href="/hakkimizda" className="opacity-80 hover:opacity-100 hover:underline transition-opacity">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="opacity-80 hover:opacity-100 hover:underline transition-opacity">
                İletişim
              </Link>
              <Link href="/sikca-sorulan-sorular" className="opacity-80 hover:opacity-100 hover:underline transition-opacity">
                S.S.S.
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main header */}
        <div className="mx-auto px-4 py-3 container">
          <div className="flex justify-between items-center gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden hover:bg-muted/50 -ml-2 p-2 rounded-xl text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative bg-gradient-to-br from-primary to-primary/80 group-hover:shadow-lg group-hover:shadow-primary/20 p-2 rounded-xl text-primary-foreground group-hover:scale-105 transition-all">
                <Mountain className="w-6 h-6" />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-none tracking-tight">ALPİN</span>
                <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.25em]">Bisiklet</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div key={item.name} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 hover:bg-muted/50 px-3 py-2 rounded-lg font-medium hover:text-primary text-sm transition-colors"
                  >
                    {item.name}
                    {item.children && (
                      <ChevronDown className="opacity-50 group-hover:opacity-100 w-3.5 h-3.5 group-hover:rotate-180 transition-all" />
                    )}
                  </Link>
                  {item.children && (
                    <div className="invisible group-hover:visible top-full left-0 z-50 absolute opacity-0 group-hover:opacity-100 pt-2 transition-all">
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-background/95 shadow-black/10 shadow-xl backdrop-blur-xl py-2 border rounded-xl min-w-56 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="flex items-center gap-2 hover:bg-primary/5 px-4 py-2.5 hover:text-primary text-sm transition-colors"
                          >
                            <span className="bg-primary/40 rounded-full w-1 h-1" />
                            {child.name}
                          </Link>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Search bar (desktop) */}
            <div className="hidden md:flex flex-1 mr-4 ml-auto max-w-sm">
              <StoreSearch className="w-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="md:hidden hover:bg-muted/50 p-2.5 rounded-xl text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setSearchOpen(true)}
                aria-label="Arama aç"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/hesabim/favorilerim"
                className="hidden sm:flex hover:bg-primary/5 p-2.5 rounded-xl text-foreground/70 hover:text-primary transition-colors"
                aria-label="Favoriler"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <AnimatedThemeToggler className="flex justify-center items-center hover:bg-muted/50 p-2.5 rounded-xl text-foreground/70 hover:text-foreground transition-colors" />

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full w-9 h-9" size="icon">
                      <Avatar className="ring-2 ring-primary/20 w-9 h-9">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                          {session.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="p-1 rounded-xl w-56" align="end" forceMount>
                    <DropdownMenuLabel className="px-3 py-2 font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="font-semibold text-sm leading-none">{session.user.name}</p>
                        <p className="text-muted-foreground text-xs leading-none">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/hesabim")} className="rounded-lg">
                      <User className="mr-2 w-4 h-4" />
                      <span>Hesabım</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/hesabim/siparislerim")} className="rounded-lg">
                      <Package className="mr-2 w-4 h-4" />
                      <span>Siparişlerim</span>
                    </DropdownMenuItem>
                    {user?.role === "ADMIN" && (
                      <DropdownMenuItem onClick={() => router.push("/admin")} className="rounded-lg">
                        <Settings className="mr-2 w-4 h-4" />
                        <span>Yönetim Paneli</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-lg text-destructive">
                      <LogOut className="mr-2 w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/giris"
                  className="hover:bg-primary/5 p-2.5 rounded-xl text-foreground/70 hover:text-primary transition-colors"
                  aria-label="Giriş yap"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Cart button with animated badge */}
              <button
                type="button"
                className="relative hover:bg-primary/5 p-2.5 rounded-xl text-foreground/70 hover:text-primary transition-colors"
                aria-label="Sepet"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {mounted && getCartCount() > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="-top-0.5 -right-0.5 absolute flex justify-center items-center bg-accent shadow-accent/30 shadow-lg rounded-full w-5 h-5 font-black text-[10px] text-accent-foreground"
                    >
                      {getCartCount()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden top-full right-0 left-0 z-50 absolute bg-background/95 shadow-xl backdrop-blur-xl p-4 border-b"
            >
              <StoreSearch
                mobile
                onClose={() => setSearchOpen(false)}
                placeholder="Ürün, marka veya kategori ara..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu — portal renders outside header to escape backdrop-filter stacking context */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-background z-[100] lg:hidden overflow-y-auto shadow-2xl"
              >
                <div className="top-0 z-10 sticky flex justify-between items-center bg-background/95 backdrop-blur p-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg">Menü</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:bg-muted p-2 rounded-xl transition-colors"
                    aria-label="Menüyü kapat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 p-4">
                  {session ? (
                    <div className="flex items-center gap-3 bg-primary/5 p-3 border border-primary/10 rounded-xl">
                      <Avatar>
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">{session.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.user.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{session.user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <Button asChild className="rounded-xl w-full" size="lg">
                      <Link href="/giris">Giriş Yap / Kayıt Ol</Link>
                    </Button>
                  )}

                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <div key={item.name} className="border-border/50 last:border-0 border-b">
                        <Link
                          href={item.href}
                          className="flex justify-between items-center py-3 w-full font-medium text-foreground/90 hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                        {item.children && (
                          <div className="space-y-1 pb-2 pl-4">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="flex items-center gap-2 py-2 text-muted-foreground hover:text-primary text-sm transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span className="bg-primary/40 rounded-full w-1 h-1" />
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                  {session && (
                    <div className="pt-4 border-t">
                      <Button variant="destructive" className="justify-start rounded-xl w-full" onClick={handleSignOut}>
                        <LogOut className="mr-2 w-4 h-4" />
                        Çıkış Yap
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
