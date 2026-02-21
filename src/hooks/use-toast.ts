"use client";

import { sileo } from "sileo";

interface ToastOptions {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
}

function toast({ title, description, variant }: ToastOptions) {
    if (variant === "destructive") {
        sileo.error({ title: title || "Hata", description });
    } else {
        sileo.success({ title: title || "Başarılı", description });
    }
}

function useToast() {
    return { toast };
}

export { toast, useToast };
