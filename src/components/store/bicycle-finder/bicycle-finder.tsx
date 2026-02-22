"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "motion/react";

// Three.js scene — SSR devre dışı
const PersonOnBike = dynamic(
    () => import("./person-on-bike").then((m) => ({ default: m.PersonOnBike })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
            </div>
        ),
    },
);

const SIZE_DATA = [
    { label: "XS", inseamMin: 60,  inseamMax: 71,  color: "#10b981", range: "60–71 cm" },
    { label: "S",  inseamMin: 72,  inseamMax: 79,  color: "#3b82f6", range: "72–79 cm" },
    { label: "M",  inseamMin: 80,  inseamMax: 86,  color: "#8b5cf6", range: "80–86 cm" },
    { label: "L",  inseamMin: 87,  inseamMax: 93,  color: "#f59e0b", range: "87–93 cm" },
    { label: "XL", inseamMin: 94,  inseamMax: 110, color: "#ef4444", range: "94+ cm" },
] as const;

function recommendSize(inseam: number) {
    return SIZE_DATA.find((s) => inseam >= s.inseamMin && inseam <= s.inseamMax) ?? SIZE_DATA[SIZE_DATA.length - 1];
}

interface BicycleFinderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFilter: (height: number, inseam: number) => void;
}

export function BicycleFinder({ open, onOpenChange, onFilter }: BicycleFinderProps) {
    const [height, setHeight] = useState(() => {
        if (typeof window === "undefined") return 170;
        return Number(localStorage.getItem("alpin_rider_height")) || 170;
    });
    const [inseam, setInseam] = useState(() => {
        if (typeof window === "undefined") return 82;
        return Number(localStorage.getItem("alpin_rider_inseam")) || 82;
    });

    // Dialog açıldığında "görüldü" olarak işaretle
    useEffect(() => {
        if (open) {
            localStorage.setItem("alpin_bike_finder_seen", "true");
        }
    }, [open]);

    const recommended = recommendSize(inseam);

    const handleFilter = useCallback(() => {
        localStorage.setItem("alpin_rider_height", height.toString());
        localStorage.setItem("alpin_rider_inseam", inseam.toString());
        onFilter(height, inseam);
        onOpenChange(false);
    }, [height, inseam, onFilter, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 gap-0 overflow-hidden sm:max-w-[1000px] max-w-[calc(100vw-1.5rem)] rounded-2xl"
                showCloseButton={true}
            >
                <DialogTitle className="sr-only">Bisiklet Bulucu</DialogTitle>

                <div className="flex flex-col sm:flex-row min-h-0">

                    {/* Sol: 3D sahne */}
                    <div
                        className="relative sm:w-[480px] shrink-0 h-[340px] sm:h-auto sm:min-h-[520px] bg-[#eef2f7]"
                    >
                        {/* Three.js canvas */}
                        <div className="w-full h-full">
                            {open && (
                                <PersonOnBike
                                    sizeLabel={recommended.label}
                                    height={height}
                                />
                            )}
                        </div>

                        {/* Orbit hint */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full pointer-events-none shadow-sm">
                            <RotateCcw className="h-3 w-3 text-gray-500" />
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">Sürükle · Yakınlaştır</span>
                        </div>

                        {/* Boyut badge */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={recommended.label}
                                initial={{ y: 6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -6, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white whitespace-nowrap shadow-lg"
                                style={{ backgroundColor: recommended.color }}
                            >
                                {recommended.label} Çerçeve
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sağ: Kontroller */}
                    <div className="flex-1 flex flex-col gap-4 p-5 min-w-0">
                        {/* Başlık */}
                        <div>
                            <p className="font-bold text-base">Bisiklet Bulucu</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Boyunuzu girerek uygun çerçeve boyutunu bulun.
                            </p>
                        </div>

                        {/* Boy */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Boyunuz</span>
                                <span className="text-sm font-bold tabular-nums">{height} cm</span>
                            </div>
                            <Slider
                                min={140} max={210} step={1}
                                value={[height]}
                                onValueChange={([v]) => setHeight(v)}
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>140 cm</span>
                                <span>210 cm</span>
                            </div>
                        </div>

                        {/* Bacak boyu */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Bacak Boyu (iç)</span>
                                <span className="text-sm font-bold tabular-nums">{inseam} cm</span>
                            </div>
                            <Slider
                                min={60} max={110} step={1}
                                value={[inseam]}
                                onValueChange={([v]) => setInseam(v)}
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>60 cm</span>
                                <span>110 cm</span>
                            </div>
                        </div>

                        {/* Öneri kartı */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={recommended.label}
                                initial={{ opacity: 0, x: 6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-3 rounded-xl border p-3"
                            >
                                <div
                                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                                    style={{ backgroundColor: recommended.color }}
                                >
                                    {recommended.label}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground">Önerilen Çerçeve</div>
                                    <div className="text-sm font-semibold truncate">
                                        {recommended.label} — Bacak boyu {recommended.range}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Boyut göstergesi */}
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {SIZE_DATA.map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex-1 rounded-full transition-all duration-200"
                                        style={{
                                            height: s.label === recommended.label ? "6px" : "4px",
                                            backgroundColor: s.label === recommended.label
                                                ? recommended.color
                                                : recommended.color + "28",
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-1">
                                {SIZE_DATA.map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex-1 text-center text-[10px] font-medium transition-colors duration-200"
                                        style={{
                                            color: s.label === recommended.label
                                                ? recommended.color
                                                : "var(--muted-foreground)",
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Buton */}
                        <Button
                            onClick={handleFilter}
                            className="w-full text-white mt-auto"
                            style={{ backgroundColor: recommended.color }}
                        >
                            Uygun Bisikletleri Göster
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
