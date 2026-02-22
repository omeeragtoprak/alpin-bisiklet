"use client";

import { motion } from "motion/react";
import { Truck, Shield, Headphones, CreditCard } from "lucide-react";

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

export function HomeFeaturesBar() {
  return (
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
              <div
                className={`${feature.color} rounded-xl p-2.5 shrink-0 transition-transform group-hover:scale-110`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
