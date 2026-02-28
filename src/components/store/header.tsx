"use client";

import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { useCartStore } from "@/store/use-cart-store";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Mountain,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCartSync } from "@/hooks/use-cart-sync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { StoreSearch } from "@/components/store/store-search";

const navigation = [
  { name: "Ana Sayfa", href: "/" },
  {
    name: "Bisikletler",
    href: "/urunler?tip=BICYCLE",
    children: [
      { name: "Dağ Bisikleti", href: "/urunler?tip=BICYCLE&kategoriler=dag-bisikleti" },
      { name: "Yol Bisikleti", href: "/urunler?tip=BICYCLE&kategoriler=yol-bisikleti" },
      { name: "Şehir Bisikleti", href: "/urunler?tip=BICYCLE&kategoriler=sehir-bisikleti" },
      { name: "Çocuk Bisikleti", href: "/urunler?tip=BICYCLE&kategoriler=cocuk-bisikleti" },
      { name: "Elektrikli Bisiklet", href: "/urunler?tip=BICYCLE&kategoriler=elektrikli-bisiklet" },
    ],
  },
  {
    name: "Aksesuarlar",
    href: "/urunler?tip=GENERAL",
    children: [
      { name: "Kask", href: "/urunler?tip=GENERAL&kategoriler=kask" },
      { name: "Aydınlatma", href: "/urunler?tip=GENERAL&kategoriler=aydinlatma" },
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
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border/50"
          : "bg-background/95 backdrop-blur border-b"
        }`}
    >
      {/* Top bar — hides on scroll */}
      <motion.div
        className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground text-xs py-2 overflow-hidden"
        animate={{
          height: scrolled ? 0 : "auto",
          opacity: scrolled ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-foreground/50 animate-pulse" />
            <p className="font-medium">Ücretsiz kargo 500 TL ve üzeri siparişlerde!</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/hakkimizda" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
              İletişim
            </Link>
            <Link href="/sikca-sorulan-sorular" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
              S.S.S.
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-2 transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
              <Mountain className="w-6 h-6" />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl leading-none tracking-tight">ALPİN</span>
              <span className="text-[10px] tracking-[0.25em] text-muted-foreground font-semibold uppercase">Bisiklet</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:rotate-180 transition-all" />
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-background/95 backdrop-blur-xl border rounded-xl shadow-xl shadow-black/10 py-2 min-w-56 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-primary/40" />
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
          <div className="hidden md:flex flex-1 max-w-sm ml-auto mr-4">
            <StoreSearch className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="md:hidden p-2.5 text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label="Arama aç"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/hesabim/favorilerim"
              className="hidden sm:flex p-2.5 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              aria-label="Favoriler"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <AnimatedThemeToggler className="p-2.5 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors" />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" size="icon">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {session.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl p-1" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/hesabim")} className="rounded-lg">
                    <User className="mr-2 h-4 w-4" />
                    <span>Hesabım</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/hesabim/siparislerim")} className="rounded-lg">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Siparişlerim</span>
                  </DropdownMenuItem>
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")} className="rounded-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Yönetim Paneli</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/giris"
                className="p-2.5 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                aria-label="Giriş yap"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Cart button with animated badge */}
            <button
              type="button"
              className="relative p-2.5 text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              aria-label="Sepet"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {mounted && getCartCount() > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-accent/30"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-background z-50 lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg">Menü</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                  aria-label="Menüyü kapat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Mobile User Section */}
                {session ? (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <Avatar>
                      <AvatarImage src={session.user.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">{session.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <Button asChild className="w-full rounded-xl" size="lg">
                    <Link href="/giris">Giriş Yap / Kayıt Ol</Link>
                  </Button>
                )}

                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <div key={item.name} className="border-b last:border-0 border-border/50">
                      <Link
                        href={item.href}
                        className="flex items-center justify-between w-full py-3 font-medium text-foreground/90 hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.children && (
                        <div className="pl-4 pb-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="w-1 h-1 rounded-full bg-primary/40" />
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
                    <Button variant="destructive" className="w-full justify-start rounded-xl" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 right-0 top-full bg-background/95 backdrop-blur-xl border-b p-4 md:hidden shadow-xl z-50"
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
  );
}
