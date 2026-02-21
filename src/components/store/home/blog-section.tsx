"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: string | null;
}

export function BlogSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blog?limit=3")
            .then((r) => r.json())
            .then((json) => setPosts(json.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (!loading && posts.length === 0) return null;

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block"
                        >
                            Bisiklet Dünyası
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-black tracking-tight"
                        >
                            Son{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Yazılarımız
                            </span>
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Button variant="outline" className="rounded-full hidden sm:flex" asChild>
                            <Link href="/blog">
                                Tüm Yazılar
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
                                <div className="aspect-video bg-muted" />
                                <div className="p-5 space-y-3">
                                    <div className="h-3 bg-muted rounded w-1/3" />
                                    <div className="h-5 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded" />
                                    <div className="h-3 bg-muted rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {posts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
                                >
                                    {/* Cover */}
                                    <div className="relative aspect-video overflow-hidden bg-muted">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
                                                <BookOpen className="h-12 w-12 text-primary/20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-5">
                                        {post.publishedAt && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                                <time dateTime={post.publishedAt}>
                                                    {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </time>
                                            </div>
                                        )}
                                        <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                                        )}
                                        <span className="text-xs font-semibold text-primary flex items-center gap-1 mt-auto">
                                            Devamını Oku
                                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Mobile CTA */}
                <div className="mt-8 text-center sm:hidden">
                    <Button variant="outline" className="rounded-full" asChild>
                        <Link href="/blog">
                            Tüm Yazılar
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
