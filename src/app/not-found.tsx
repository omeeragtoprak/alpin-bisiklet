import Link from "next/link";

/**
 * 404 - Sayfa Bulunamadı
 * Mevcut olmayan rotalara erişildiğinde gösterilir
 */
export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 min-h-screen">
      <div className="text-center">
        <h1 className="font-bold text-gray-900 text-6xl">404</h1>
        <h2 className="mt-2 font-semibold text-gray-700 text-2xl">Sayfa Bulunamadı</h2>
        <p className="mt-2 text-gray-500">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      </div>
      <Link
        href="/"
        className="bg-gray-900 hover:bg-gray-700 mt-4 px-6 py-2 rounded-md font-medium text-white text-sm transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
