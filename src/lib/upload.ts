import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "image/gif", // GIF animasyon desteği
];

const ALLOWED_MODEL_TYPES = [
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream", // .glb çoğunlukla bu mime ile gelir
];
const MAX_MODEL_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Benzersiz dosya adı oluşturur
 */
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const slug = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${slug}-${timestamp}-${random}${ext}`;
}

/**
 * Görsel yükler
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // Dosya tipi kontrolü
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Desteklenmeyen dosya tipi: ${file.type}. İzin verilen tipler: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      };
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: `Dosya çok büyük. Maksimum boyut: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      };
    }

    const filename = generateUniqueFilename(file.name);
    const uploadDir = path.join(UPLOAD_DIR, "images");
    const filepath = path.join(uploadDir, filename);

    // Klasör yoksa oluştur
    await mkdir(uploadDir, { recursive: true });

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return {
      success: true,
      url: `/uploads/images/${filename}`,
      filename,
    };
  } catch (error) {
    console.error("Görsel yükleme hatası:", error);
    return {
      success: false,
      error: "Görsel yüklenirken bir hata oluştu",
    };
  }
}

/**
 * Video yükler
 */
export async function uploadVideo(file: File): Promise<UploadResult> {
  try {
    // Dosya tipi kontrolü
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Desteklenmeyen dosya tipi: ${file.type}. İzin verilen tipler: ${ALLOWED_VIDEO_TYPES.join(", ")}`,
      };
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_VIDEO_SIZE) {
      return {
        success: false,
        error: `Dosya çok büyük. Maksimum boyut: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
      };
    }

    const filename = generateUniqueFilename(file.name);
    const uploadDir = path.join(UPLOAD_DIR, "videos");
    const filepath = path.join(uploadDir, filename);

    // Klasör yoksa oluştur
    await mkdir(uploadDir, { recursive: true });

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return {
      success: true,
      url: `/uploads/videos/${filename}`,
      filename,
    };
  } catch (error) {
    console.error("Video yükleme hatası:", error);
    return {
      success: false,
      error: "Video yüklenirken bir hata oluştu",
    };
  }
}

/**
 * 3D model (GLB/GLTF) yükler
 */
export async function uploadModel3d(file: File): Promise<UploadResult> {
  try {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["glb", "gltf"].includes(ext)) {
      return { success: false, error: "Sadece .glb ve .gltf dosyaları desteklenir" };
    }
    if (file.size > MAX_MODEL_SIZE) {
      return { success: false, error: `Dosya çok büyük. Maksimum: ${MAX_MODEL_SIZE / 1024 / 1024}MB` };
    }

    const filename = generateUniqueFilename(file.name);
    const uploadDir = path.join(UPLOAD_DIR, "models");
    const filepath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return { success: true, url: `/uploads/models/${filename}`, filename };
  } catch (error) {
    console.error("3D model yükleme hatası:", error);
    return { success: false, error: "3D model yüklenirken bir hata oluştu" };
  }
}

/**
 * Dosya siler
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    // URL'den dosya yolunu çıkar
    const relativePath = url.replace(/^\/uploads\//, "");
    const filepath = path.resolve(UPLOAD_DIR, relativePath);

    // Path traversal koruması: dosya UPLOAD_DIR içinde olmalı
    if (!filepath.startsWith(path.resolve(UPLOAD_DIR))) {
      throw new Error("Geçersiz dosya yolu");
    }

    await unlink(filepath);
    return true;
  } catch (error) {
    console.error("Dosya silme hatası:", error);
    return false;
  }
}

/**
 * Birden fazla görsel yükler
 */
export async function uploadImages(files: File[]): Promise<UploadResult[]> {
  const results = await Promise.all(files.map((file) => uploadImage(file)));
  return results;
}
