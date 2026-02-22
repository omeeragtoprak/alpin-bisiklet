"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Mountain,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

const footerLinks = {
  kurumsal: [
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "İletişim", href: "/iletisim" },
    { name: "Mağazalarımız", href: "/magazalarimiz" },
    { name: "Kariyer", href: "/kariyer" },
  ],
  musteri: [
    { name: "Siparişlerim", href: "/hesabim/siparislerim" },
    { name: "Favori Ürünlerim", href: "/hesabim/favorilerim" },
    { name: "Hesap Bilgilerim", href: "/hesabim/ayarlar" },
    { name: "S.S.S.", href: "/sikca-sorulan-sorular" },
  ],
  politikalar: [
    { name: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { name: "İade ve Değişim", href: "/iade-kosullari" },
    { name: "Kargo Bilgileri", href: "/kargo-bilgileri" },
    { name: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com", icon: Facebook },
  { name: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com", icon: Instagram },
  { name: "Twitter", href: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com", icon: Twitter },
  { name: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com", icon: Youtube },
];

type SubscribeForm = z.infer<typeof subscribeSchema>;

function NewsletterForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubscribeForm>({
    resolver: zodResolver(subscribeSchema),
  });

  async function onSubmit(data: SubscribeForm) {
    setServerError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Bir hata oluştu");
      } else {
        setSuccess(true);
        reset();
      }
    } catch {
      setServerError("Bağlantı hatası, lütfen tekrar deneyin.");
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 w-full max-w-md">
        <CheckCircle className="h-5 w-5 text-accent shrink-0" />
        <p className="text-sm font-medium">Abone oldunuz! Onay maili gönderildi.</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col w-full max-w-md gap-1.5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="E-posta adresiniz"
          {...register("email")}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 rounded-xl h-12"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-12 px-6 font-bold shadow-lg shadow-accent/20 shrink-0"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <>Abone Ol <ArrowRight className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      </div>
      {errors.email && (
        <p className="text-sm text-red-300">{errors.email.message}</p>
      )}
      {serverError && (
        <p className="text-sm text-red-300">{serverError}</p>
      )}
    </form>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-14 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <svg className="absolute bottom-0 left-0 right-0 text-foreground/5" viewBox="0 0 1440 60">
            <path fill="currentColor" d="M0,30L60,25C120,20,240,10,360,15C480,20,600,40,720,45C840,50,960,40,1080,30C1200,20,1320,10,1380,5L1440,0L1440,60L0,60Z" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                Kampanyalardan ilk siz haberdar olun!
              </h3>
              <p className="text-primary-foreground/70 max-w-md">
                E-posta bültenimize abone olun, yeni ürünleri ve size özel fırsatları kaçırmayın.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2.5 group w-fit">
                <div className="bg-primary text-primary-foreground rounded-xl p-2 transition-transform group-hover:scale-105">
                  <Mountain className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl leading-none tracking-tight">ALPİN</span>
                  <span className="text-[10px] tracking-[0.25em] text-background/60 font-semibold uppercase">
                    Bisiklet
                  </span>
                </div>
              </Link>
              <p className="text-background/60 leading-relaxed max-w-sm">
                1990'dan beri Türkiye'nin en güvenilir bisiklet mağazası.
                Dünya markaları, profesyonel servis ve müşteri odaklı hizmet anlayışıyla yanınızdayız.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-background/60 group">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <span className="group-hover:text-background transition-colors text-sm pt-0.5">
                    Örnek Mah. Bisiklet Cad. No:123, Kadıköy / İstanbul
                  </span>
                </div>
                <div className="flex items-center gap-3 text-background/60 group">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <span className="group-hover:text-background transition-colors text-sm">
                    0850 123 45 67
                  </span>
                </div>
                <div className="flex items-center gap-3 text-background/60 group">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <span className="group-hover:text-background transition-colors text-sm">
                    info@alpinbisiklet.com
                  </span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-base mb-5 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-primary rounded-full" />
                  Kurumsal
                </h4>
                <ul className="space-y-2.5">
                  {footerLinks.kurumsal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-background/50 hover:text-primary hover:pl-1.5 transition-all duration-300 block text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-base mb-5 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-primary rounded-full" />
                  Müşteri Hizmetleri
                </h4>
                <ul className="space-y-2.5">
                  {footerLinks.musteri.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-background/50 hover:text-primary hover:pl-1.5 transition-all duration-300 block text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1">
                <h4 className="font-bold text-base mb-5 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-primary rounded-full" />
                  Politikalar
                </h4>
                <ul className="space-y-2.5">
                  {footerLinks.politikalar.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-background/50 hover:text-primary hover:pl-1.5 transition-all duration-300 block text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-background/40 text-center md:text-left">
                &copy; {new Date().getFullYear()} Alpin Bisiklet. Tüm hakları saklıdır.
              </p>

              <div className="flex items-center gap-2">
                {["VISA", "MasterCard", "Troy"].map((card) => (
                  <div key={card} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] font-bold text-white/60">{card}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 p-2.5 rounded-xl text-background/50 hover:text-white hover:bg-primary hover:scale-110 transition-all duration-300"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
