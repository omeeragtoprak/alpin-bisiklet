"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Loader2, Link as LinkIcon, Upload } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [tab, setTab] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("files", files[0]);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Resim yüklenemedi");
      }

      onChange([...value, data.url]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Resim yüklenirken bir hata oluştu.";
      toast({ title: "Yükleme Hatası", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    // Simple URL validation
    try {
      new URL(trimmed);
    } catch {
      toast({
        title: "Geçersiz URL",
        description: "Lütfen geçerli bir görsel URL'si girin (https://...)",
        variant: "destructive",
      });
      return;
    }

    if (value.includes(trimmed)) {
      toast({ title: "Bu görsel zaten ekli", variant: "destructive" });
      return;
    }

    onChange([...value, trimmed]);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {value.map((url) => (
            <div
              key={url}
              className="relative w-[120px] h-[120px] rounded-md overflow-hidden border bg-muted"
            >
              <div className="z-10 absolute top-1 right-1">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Image fill className="object-cover" alt="Görsel" src={url} />
            </div>
          ))}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setTab("file")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "file"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Dosya Yükle
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "url"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          URL ile Ekle
        </button>
      </div>

      {/* File upload */}
      {tab === "file" && (
        <div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={onUpload}
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            {isUploading ? "Yükleniyor..." : "Resim Seç"}
          </Button>
        </div>
      )}

      {/* URL input */}
      {tab === "url" && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/resim.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            disabled={disabled}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddUrl}
            disabled={disabled || !urlInput.trim()}
          >
            <LinkIcon className="h-4 w-4 mr-1.5" />
            Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
