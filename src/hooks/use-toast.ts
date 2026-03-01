"use client";

import { sileo } from "sileo";

interface ToastOptions {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
}

function getThemeFill(): string {
    if (typeof document === "undefined") return "oklch(1 0 0)";
    return document.documentElement.classList.contains("dark")
        ? "oklch(0.20 0.02 155)"
        : "oklch(1 0 0)";
}

function toast({ title, description, variant }: ToastOptions) {
    const fill = getThemeFill();
    if (variant === "destructive") {
        sileo.error({ title: title || "Hata", description, fill });
    } else {
        sileo.success({ title: title || "Başarılı", description, fill });
    }
}

function useToast() {
    return { toast };
}

export { toast, useToast };
