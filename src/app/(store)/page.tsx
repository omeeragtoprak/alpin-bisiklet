"use client";

import Link from "next/link";
import { ArrowRight, Truck, Shield, Headphones, CreditCard, Bike, Award, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ParallaxHero } from "@/components/store/home/parallax-hero";
import { FeaturedCategories } from "@/components/store/home/featured-categories";
import { ProductShowcase } from "@/components/store/home/product-showcase";
import { NewProductsSection } from "@/components/store/home/new-products-section";
import { BrandMarquee } from "@/components/store/home/brand-marquee";
import { DiscountedProductsSection } from "@/components/store/home/discounted-products-section";
import { PopularProductsSection } from "@/components/store/home/popular-products-section";

const features = [
  {
    icon: Truck,
    title: "Ücretsiz Kargo",
    description: "500 TL ve üzeri siparişlerde",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Güvenli Ödeme",
    description: "256-bit SSL şifreleme",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Her zaman yanınızdayız",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: CreditCard,
    title: "Taksit İmkanı",
    description: "12 aya varan taksit",
    color: "text-amber-600 bg-amber-50",
  },
];

const stats = [
  { value: "15.000+", label: "Mutlu Müşteri", icon: Star },
  { value: "50+", label: "Dünya Markası", icon: Award },
  { value: "3.000+", label: "Ürün Çeşidi", icon: Bike },
  { value: "30+ Yıl", label: "Tecrübe", icon: Clock },
];

export default function StorePage() {
  return (
    <>
      {/* Full-screen Parallax Hero with 3D */}
      <ParallaxHero />

      {/* Trust Features Bar */}
      <section className="border-y bg-card relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-default"
              >
                <div className={`${feature.color} rounded-xl p-2.5 shrink-0 transition-transform group-hover:scale-110`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <FeaturedCategories />

      {/* Product Showcase — horizontal scroll */}
      <ProductShowcase />

      {/* New Products Grid */}
      <NewProductsSection />

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* Discounted Products Carousel */}
      <DiscountedProductsSection />

      {/* Popular Products Grid */}
      <PopularProductsSection />

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
              <svg className="absolute bottom-0 left-0 right-0 text-white/5" viewBox="0 0 1440 100">
                <path fill="currentColor" d="M0,40L60,45C120,50,240,60,360,55C480,50,600,30,720,25C840,20,960,30,1080,40C1200,50,1320,60,1380,65L1440,70L1440,100L0,100Z" />
              </svg>
            </div>

            <div className="relative p-10 md:p-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">
                  Rakamlarla Alpin Bisiklet
                </h2>
                <p className="text-primary-foreground/70 max-w-xl mx-auto">
                  30 yılı aşkın tecrübemizle Türkiye'nin en güvenilir bisiklet mağazası
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center group"
                  >
                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all group-hover:scale-105">
                      <stat.icon className="h-7 w-7 text-accent mx-auto mb-3" />
                      <div className="text-3xl md:text-4xl font-black text-primary-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs font-medium text-primary-foreground/60 uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Newsletter Banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 rounded-3xl overflow-hidden border"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Yeni Üyelere Özel{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  %10 İndirim!
                </span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                Hemen üye olun, ilk siparişinizde %10 indirim kazanın.
                Kampanyalardan ve fırsatlardan ilk siz haberdar olun.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link href="/kayit">
                    Hemen Üye Ol
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-full"
                  asChild
                >
                  <Link href="/urunler">Ürünleri İncele</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
