"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center space-y-4 px-4">
                <h1 className="text-6xl font-extrabold text-destructive">Hata</h1>
                <h2 className="text-2xl font-bold">Bir sorun oluştu</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground font-mono">
                        Hata kodu: {error.digest}
                    </p>
                )}
                <div className="flex gap-3 justify-center pt-4">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 rounded-lg border font-medium hover:bg-muted transition-colors"
                    >
                        Ana Sayfa
                    </a>
                </div>
            </div>
        </div>
    );
}
