"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Mountain, Award, Users, Wrench } from "lucide-react";
import type { Metadata } from "next";

export default function AboutPage() {
    const { data: page } = useQuery({
        queryKey: ["page", "hakkimizda"],
        queryFn: async () => {
            const res = await fetch("/api/pages/by-slug/hakkimizda");
            if (!res.ok) return null;
            const json = await res.json();
            return json.data;
        },
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Hakkımızda</h1>

                {page?.content ? (
                    <div
                        className="prose prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                ) : (
                    <div className="space-y-8">
                        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                            1990 yılından bu yana Türkiye&apos;nin en güvenilir bisiklet mağazası olarak
                            hizmet vermekteyiz. Dünya markalarını, profesyonel servisi ve müşteri
                            odaklı hizmet anlayışıyla bir araya getiriyoruz.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                            {[
                                { icon: Mountain, title: "35+ Yıl", desc: "Sektör deneyimi" },
                                { icon: Award, title: "50+ Marka", desc: "Dünya markası" },
                                { icon: Users, title: "100K+", desc: "Mutlu müşteri" },
                                { icon: Wrench, title: "Profesyonel", desc: "Servis hizmeti" },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="text-center p-6 rounded-xl border bg-card"
                                >
                                    <item.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 mt-8">
                            <h2 className="text-2xl font-bold">Misyonumuz</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Bisiklet tutkunlarına en kaliteli ürünleri, en uygun fiyatlarla sunmak ve
                                bisiklet kültürünü Türkiye&apos;de yaygınlaştırmak temel misyonumuzdur. Her
                                seviyeden bisikletçiye profesyonel destek sağlayarak, sağlıklı ve çevre
                                dostu bir ulaşım alternatifi sunmayı hedefliyoruz.
                            </p>

                            <h2 className="text-2xl font-bold">Vizyonumuz</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Türkiye&apos;nin lider bisiklet perakende platformu olarak, müşterilerimize
                                dünya standartlarında alışveriş deneyimi sunmak ve bisiklet sporunu
                                herkes için erişilebilir kılmak vizyonumuzdur.
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
