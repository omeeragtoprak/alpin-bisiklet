"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md border-destructive/30">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold">Sayfa yüklenemedi</h2>
            <p className="text-muted-foreground text-sm">
              Bu sayfada beklenmedik bir hata oluştu.
            </p>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-md inline-block">
              {error.digest}
            </p>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={reset} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin">
                <Home className="h-4 w-4 mr-2" />
                Panele Dön
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
