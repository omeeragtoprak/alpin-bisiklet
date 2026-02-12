"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BannerPreviewProps {
  title?: string;
  subtitle?: string;
  image?: string;
  mobileImage?: string;
  buttonText?: string;
  link?: string;
}

export function BannerPreview({
  title,
  subtitle,
  image,
  mobileImage,
  buttonText,
  link,
}: BannerPreviewProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const previewImage = view === "mobile" && mobileImage ? mobileImage : image;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Onizleme</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={view === "desktop" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("desktop")}
            aria-label="Masaustu onizleme"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "mobile" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("mobile")}
            aria-label="Mobil onizleme"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`relative overflow-hidden rounded-lg bg-muted ${
            view === "mobile" ? "max-w-[320px] mx-auto" : "w-full"
          }`}
          style={{ aspectRatio: view === "mobile" ? "9/16" : "16/9" }}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Banner onizleme"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Gorsel yukleyin
            </div>
          )}

          {/* Overlay */}
          {(title || subtitle || buttonText) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 md:p-6">
              {title && (
                <h3
                  className={`font-bold text-white ${
                    view === "mobile" ? "text-lg" : "text-2xl"
                  }`}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={`text-white/80 mt-1 ${
                    view === "mobile" ? "text-xs" : "text-sm"
                  }`}
                >
                  {subtitle}
                </p>
              )}
              {buttonText && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-black text-sm font-medium">
                    {buttonText}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        {link && (
          <p className="mt-2 text-xs text-muted-foreground truncate">
            Link: {link}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
