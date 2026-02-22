"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "motion/react";

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

function BicycleIllustration({ sizeLabel, height }: { sizeLabel: string; height: number }) {
    const size = SIZE_DATA.find((s) => s.label === sizeLabel) ?? SIZE_DATA[2];
    const c = size.color;
    // Boy 140–210 arası → kişi ölçeği 0.84–1.1
    const ps = 0.84 + ((height - 140) / 70) * 0.26;

    const spokes = (cx: number, cy: number, r: number) =>
        [0, 60, 120].map((a) => (
            <line
                key={a}
                x1={cx + Math.cos((a * Math.PI) / 180) * r}
                y1={cy + Math.sin((a * Math.PI) / 180) * r}
                x2={cx - Math.cos((a * Math.PI) / 180) * r}
                y2={cy - Math.sin((a * Math.PI) / 180) * r}
                stroke={c}
                strokeWidth="1.5"
                strokeOpacity="0.3"
            />
        ));

    return (
        <svg viewBox="0 0 280 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Arka tekerlek */}
            <circle cx="212" cy="133" r="44" stroke={c} strokeWidth="6" strokeOpacity="0.85" />
            <circle cx="212" cy="133" r="7" fill={c} />
            {spokes(212, 133, 44)}

            {/* Ön tekerlek */}
            <circle cx="68" cy="133" r="44" stroke={c} strokeWidth="6" strokeOpacity="0.85" />
            <circle cx="68" cy="133" r="7" fill={c} />
            {spokes(68, 133, 44)}

            {/* Chain stay */}
            <line x1="188" y1="133" x2="212" y2="113" stroke={c} strokeWidth="5" strokeLinecap="round" />
            {/* Seat stay */}
            <line x1="165" y1="72" x2="212" y2="113" stroke={c} strokeWidth="4" strokeLinecap="round" />
            {/* Seat tube */}
            <line x1="188" y1="133" x2="165" y2="72" stroke={c} strokeWidth="6.5" strokeLinecap="round" />
            {/* Top tube */}
            <line x1="165" y1="72" x2="78" y2="72" stroke={c} strokeWidth="5.5" strokeLinecap="round" />
            {/* Down tube */}
            <line x1="83" y1="89" x2="188" y2="133" stroke={c} strokeWidth="7" strokeLinecap="round" />
            {/* Head tube */}
            <line x1="78" y1="72" x2="83" y2="89" stroke={c} strokeWidth="9" strokeLinecap="round" />
            {/* Fork */}
            <line x1="83" y1="89" x2="68" y2="120" stroke="rgba(200,210,230,0.7)" strokeWidth="5" strokeLinecap="round" />
            {/* Seat post */}
            <line x1="165" y1="72" x2="158" y2="54" stroke="rgba(200,210,230,0.7)" strokeWidth="4" strokeLinecap="round" />
            {/* Saddle */}
            <line x1="144" y1="52" x2="172" y2="52" stroke="rgba(255,255,255,0.95)" strokeWidth="5.5" strokeLinecap="round" />
            {/* Stem */}
            <line x1="78" y1="72" x2="74" y2="62" stroke="rgba(200,210,230,0.7)" strokeWidth="4" strokeLinecap="round" />
            {/* Handlebars */}
            <line x1="65" y1="62" x2="85" y2="62" stroke="rgba(255,255,255,0.88)" strokeWidth="5" strokeLinecap="round" />
            {/* Chainring */}
            <circle cx="188" cy="133" r="17" stroke={c} strokeWidth="2.5" strokeOpacity="0.55" />

            {/* Kişi — boyuna göre ölçeklenir */}
            <g
                transform={`translate(158 53) scale(${ps}) translate(-158 -53)`}
                style={{ transition: "transform 0.15s ease" }}
            >
                {/* Kafa */}
                <circle cx="118" cy="36" r="13" fill="rgba(255,255,255,0.93)" />
                {/* Gövde (öne eğik) */}
                <line x1="152" y1="53" x2="107" y2="60" stroke="rgba(255,255,255,0.9)" strokeWidth="9" strokeLinecap="round" />
                {/* Kollar */}
                <line x1="107" y1="60" x2="74" y2="61" stroke="rgba(255,255,255,0.9)" strokeWidth="7" strokeLinecap="round" />
                {/* Sağ bacak */}
                <line x1="155" y1="53" x2="184" y2="98" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
                <line x1="184" y1="98" x2="192" y2="124" stroke="rgba(255,255,255,0.9)" strokeWidth="7" strokeLinecap="round" />
                {/* Sol bacak */}
                <line x1="154" y1="53" x2="175" y2="100" stroke="rgba(255,255,255,0.78)" strokeWidth="7" strokeLinecap="round" />
                <line x1="175" y1="100" x2="172" y2="128" stroke="rgba(255,255,255,0.78)" strokeWidth="6" strokeLinecap="round" />
            </g>
        </svg>
    );
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
                className="p-0 gap-0 overflow-hidden sm:max-w-[660px] max-w-[calc(100vw-1.5rem)] rounded-2xl"
                showCloseButton={true}
            >
                <DialogTitle className="sr-only">Bisiklet Bulucu</DialogTitle>

                <div className="flex flex-col sm:flex-row min-h-0">
                    {/* Sol: Bisiklet Görseli */}
                    <div
                        className="relative sm:w-[260px] shrink-0 h-[200px] sm:h-auto flex items-center justify-center p-4"
                        style={{
                            background: "linear-gradient(160deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)",
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={recommended.label}
                                initial={{ opacity: 0.6 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                <BicycleIllustration
                                    sizeLabel={recommended.label}
                                    height={height}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Boyut badge */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={recommended.label}
                                initial={{ y: 6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -6, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white whitespace-nowrap"
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

                        {/* Öneri */}
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
