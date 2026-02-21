"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
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
            const message = error instanceof Error ? error.message : "Resim yüklenirken bir hata oluştu.";
            toast({ title: "Yükleme Hatası", description: message, variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
                    >
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}
            </div>
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
                    Resim Yükle
                </Button>
            </div>
        </div>
    );
}
