"use client";

import { motion } from "motion/react";
import { Star, Award, Bike, Clock } from "lucide-react";

const stats = [
  { value: "15.000+", label: "Mutlu Müşteri", icon: Star },
  { value: "50+", label: "Dünya Markası", icon: Award },
  { value: "3.000+", label: "Ürün Çeşidi", icon: Bike },
  { value: "30+ Yıl", label: "Tecrübe", icon: Clock },
];

export function HomeStats() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
            <svg
              className="absolute bottom-0 left-0 right-0 text-white/5"
              viewBox="0 0 1440 100"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M0,40L60,45C120,50,240,60,360,55C480,50,600,30,720,25C840,20,960,30,1080,40C1200,50,1320,60,1380,65L1440,70L1440,100L0,100Z"
              />
            </svg>
          </div>

          <div className="relative p-10 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">
                Rakamlarla Alpin Bisiklet
              </h2>
              <p className="text-primary-foreground/70 max-w-xl mx-auto">
                30 yılı aşkın tecrübemizle Türkiye&apos;nin en güvenilir
                bisiklet mağazası
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
  );
}
