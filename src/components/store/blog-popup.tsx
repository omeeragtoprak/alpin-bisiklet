"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
}

const STORAGE_KEY = "blog_popup_dismissed";
const POPUP_DELAY_MS = 8000; // 8 saniye sonra göster

export function BlogPopup() {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Session'da zaten kapatılmışsa gösterme
        if (sessionStorage.getItem(STORAGE_KEY)) return;

        fetch("/api/blog?limit=1")
            .then((r) => r.json())
            .then((json) => {
                const first: BlogPost | undefined = json.data?.[0];
                if (!first) return;
                setPost(first);

                const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
                return () => clearTimeout(timer);
            })
            .catch(() => {});
    }, []);

    function dismiss() {
        setVisible(false);
        sessionStorage.setItem(STORAGE_KEY, "1");
    }

    if (!post) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border bg-card shadow-2xl shadow-black/10 overflow-hidden"
                    role="dialog"
                    aria-label="Yeni blog yazısı"
                >
                    {/* Kapat butonu */}
                    <button
                        onClick={dismiss}
                        className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Kapat"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Kapak görseli */}
                    <div className="relative h-36 bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden">
                        {post.coverImage ? (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="320px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-primary/20" />
                            </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    </div>

                    {/* İçerik */}
                    <div className="p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                            Yeni Blog Yazısı
                        </p>
                        <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2">
                            {post.title}
                        </h3>
                        {post.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {post.excerpt}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button size="sm" className="flex-1 rounded-full text-xs h-8" asChild onClick={dismiss}>
                                <Link href={`/blog/${post.slug}`}>
                                    Oku
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs h-8 px-3"
                                onClick={dismiss}
                            >
                                Kapat
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
