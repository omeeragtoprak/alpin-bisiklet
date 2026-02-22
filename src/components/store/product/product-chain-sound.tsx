"use client";

import { useEffect, useRef } from "react";

/**
 * Bisiklet zincir/dişli sesi — Web Audio API ile procedural olarak üretilir.
 * ctx.resume() çağrısı ile suspended context sorunu çözülür.
 * Ses dosyası gerekmez, tamamen synthesis ile üretilir.
 */
async function playChainSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Suspended ise kullanıcı etkileşimi sonrası resume et
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") return;

    const now = ctx.currentTime;
    const clicks = 10;
    const interval = 0.055;

    for (let i = 0; i < clicks; i++) {
      const t = now + i * interval;

      // Metalik dişli tık sesi
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200 + Math.random() * 100, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.04);

      filter.type = "bandpass";
      filter.frequency.value = 900 + i * 100;
      filter.Q.value = 1.8;

      // Daha yüksek gain — duyulabilir seviye
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35 - i * 0.02, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.048);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.055);
    }

    // Zincir kayma sesi (metalik sürtünme)
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      data[j] = (Math.random() * 2 - 1) * 0.12;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 2800;
    noiseFilter.Q.value = 0.7;

    const noiseGain = ctx.createGain();
    const noiseStart = now + clicks * interval + 0.02;
    noiseGain.gain.setValueAtTime(0.22, noiseStart);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, noiseStart + 0.18);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(noiseStart);
    noiseSource.stop(noiseStart + 0.2);

    // Context'i biraz sonra kapat
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Autoplay engeli veya desteklenmeyen ortam — sessizce devam et
  }
}

interface ProductChainSoundProps {
  enabled?: boolean;
}

export function ProductChainSound({ enabled = true }: ProductChainSoundProps) {
  const played = useRef(false);

  useEffect(() => {
    if (!enabled || played.current) return;
    played.current = true;

    // 200ms gecikme: sayfa mount animasyonuyla senkronize
    const timer = setTimeout(() => {
      playChainSound();
    }, 200);

    return () => clearTimeout(timer);
  }, [enabled]);

  return null;
}
