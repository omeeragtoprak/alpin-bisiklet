"use client";

import { Monitor, Smartphone, ArrowRight, Layers, Info } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BannerPreviewProps {
  title?: string;
  subtitle?: string;
  image?: string;
  mobileImage?: string;
  buttonText?: string;
  link?: string;
  position?: string;
  /** Carousel'daki sıra (0-indexed) */
  order?: number;
}

export function BannerPreview({
  title,
  subtitle,
  image,
  mobileImage,
  buttonText,
  link,
  position = "HERO",
  order = 0,
}: BannerPreviewProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const previewImage = view === "mobile" && mobileImage ? mobileImage : image;
  const isHero = position === "HERO";
  const carouselPosition = order + 2; // +1 for 0-index, +1 for default "Zirveye Pedalla" slide

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <CardTitle className="text-sm shrink-0">Önizleme</CardTitle>
          {isHero && (
            <Badge variant="secondary" className="text-xs gap-1 shrink-0">
              <Layers className="h-3 w-3" />
              Slayt #{carouselPosition}
            </Badge>
          )}
        </div>

        {/* Desktop / Mobile toggle — type="button" zorunlu, yoksa form submit tetiklenir */}
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setView("desktop")}
            aria-label="Masaüstü önizleme"
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${
              view === "desktop"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setView("mobile")}
            aria-label="Mobil önizleme"
            className={`h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors ${
              view === "mobile"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* ─── Preview container ────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-lg bg-muted transition-all duration-300 ${
            view === "mobile" ? "max-w-[200px] mx-auto" : "w-full"
          }`}
          style={{ aspectRatio: view === "mobile" ? "9/19.5" : "16/7" }}
        >
          {/* Background image or placeholder */}
          {previewImage ? (
            <img
              src={previewImage}
              alt="Banner önizleme"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
              <Monitor className="h-8 w-8" />
              <p className="text-xs">Görsel yükleyin</p>
            </div>
          )}

          {/* Gradient overlays — matches actual hero site */}
          {previewImage && (
            <>
              <div
                className={`absolute inset-0 ${
                  view === "desktop"
                    ? "bg-gradient-to-r from-black/65 via-black/35 to-transparent"
                    : "bg-gradient-to-t from-black/75 via-black/30 to-transparent"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </>
          )}

          {/* Content — matches actual hero layout */}
          {previewImage && (
            <div
              className={`absolute inset-0 flex flex-col p-3 md:p-4 ${
                view === "desktop" ? "justify-center" : "justify-end"
              }`}
            >
              {/* Subtitle badge — max 2 line, breaks nicely */}
              {subtitle && (
                <div className="mb-1.5 flex">
                  <span
                    className={`inline-block bg-green-600/85 text-white rounded-full font-medium leading-snug max-w-[80%] ${
                      view === "mobile"
                        ? "text-[7px] px-1.5 py-0.5"
                        : "text-[9px] px-2 py-0.5"
                    }`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {subtitle.length > 60 ? subtitle.slice(0, 57) + "…" : subtitle}
                  </span>
                </div>
              )}

              {/* Title */}
              {title && (
                <p
                  className={`font-black text-white leading-tight drop-shadow-sm ${
                    view === "mobile" ? "text-sm" : "text-base md:text-lg"
                  }`}
                >
                  {title.length > 80 ? title.slice(0, 77) + "…" : title}
                </p>
              )}

              {/* CTA button */}
              {(buttonText || link) && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 bg-white text-black font-semibold rounded-full leading-none ${
                      view === "mobile" ? "text-[7px] px-2 py-1" : "text-[9px] px-2.5 py-1"
                    }`}
                  >
                    {buttonText || "İncele"}
                    <ArrowRight className="h-2 w-2" />
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dot indicators overlay (desktop, HERO only) */}
          {isHero && view === "desktop" && previewImage && (
            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-3.5 h-1.5 rounded-full bg-white shadow-sm" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            </div>
          )}

          {/* Prev/Next hint */}
          {isHero && view === "desktop" && previewImage && (
            <>
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/25 flex items-center justify-center text-white/70 text-[10px]">
                ‹
              </div>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/25 flex items-center justify-center text-white/70 text-[10px]">
                ›
              </div>
            </>
          )}
        </div>

        {/* ─── Info row ─────────────────────────────────────── */}
        <div className="space-y-1">
          {isHero && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
              <span>
                Ana sayfa hero carousel'ında{" "}
                <strong className="text-foreground">"Zirveye Pedalla"</strong>{" "}
                slaydından sonra{" "}
                <strong className="text-foreground">#{order + 1}. sırada</strong>{" "}
                görünecek.
              </span>
            </div>
          )}
          {link && (
            <p className="text-xs text-muted-foreground truncate">
              <span className="font-medium text-foreground">Link:</span> {link}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
