"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { usePopupBanner } from "@/hooks";

const STORAGE_KEY = "alpin_popup_banner_dismissed";

/**
 * POPUP pozisyonlu banner — sayfa yüklendikten 3 saniye sonra çıkar.
 * Session storage ile bir kez gösterilir (yeni oturum açana kadar).
 */
export function PopupBanner() {
  const { data: banner } = usePopupBanner();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!banner) return;

    // Daha önce kapatıldıysa gösterme
    const dismissed = sessionStorage.getItem(`${STORAGE_KEY}_${banner.id}`);
    if (dismissed) return;

    // 3 saniye sonra göster
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [banner]);

  const handleDismiss = () => {
    if (banner) {
      sessionStorage.setItem(`${STORAGE_KEY}_${banner.id}`, "1");
    }
    setVisible(false);
  };

  if (!banner || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md pointer-events-auto animate-in zoom-in-95 fade-in duration-300 rounded-2xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: "3/4" }}
        >
          {/* Görsel */}
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Kapat butonu */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-sm"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>

          {/* İçerik */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {banner.subtitle && (
              <span className="inline-block bg-primary/80 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
                {banner.subtitle}
              </span>
            )}
            <h2 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow">
              {banner.title}
            </h2>
            {banner.link && (
              <Link
                href={banner.link}
                onClick={handleDismiss}
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 font-semibold text-sm px-5 py-3 rounded-full transition-all shadow-xl mt-4 w-fit"
              >
                {banner.buttonText || "İncele"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {/* Alt kapatma linki */}
            <button
              type="button"
              onClick={handleDismiss}
              className="mt-3 text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              Hayır teşekkürler, kapatın
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
