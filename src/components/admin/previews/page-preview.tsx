"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PagePreviewProps {
  title?: string;
  content?: string;
}

export function PagePreview({ title, content }: PagePreviewProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Sayfa Onizleme</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={view === "desktop" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("desktop")}
            aria-label="Masaustu"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "mobile" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("mobile")}
            aria-label="Mobil"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`mx-auto rounded-lg border bg-white p-6 overflow-auto ${
            view === "mobile" ? "max-w-[375px]" : "w-full"
          }`}
          style={{ minHeight: 200, maxHeight: 400 }}
        >
          {title && (
            <h1
              className={`font-bold text-gray-900 mb-4 ${
                view === "mobile" ? "text-xl" : "text-3xl"
              }`}
            >
              {title}
            </h1>
          )}
          {content ? (
            <div
              className={`prose prose-neutral max-w-none ${
                view === "mobile" ? "prose-sm" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-400 text-sm italic">İçerik yazın...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
