import Link from "next/link";

/**
 * 403 - Erişim Yasak
 * Kullanıcının yetkisi olmayan kaynaklara erişmeye çalıştığında gösterilir
 * forbidden() fonksiyonu çağrıldığında render edilir
 */
export default function Forbidden() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 min-h-screen">
      <div className="text-center">
        <h1 className="font-bold text-gray-900 text-6xl">403</h1>
        <h2 className="mt-2 font-semibold text-gray-700 text-2xl">Erişim Yasak</h2>
        <p className="mt-2 text-gray-500">Bu kaynağa erişim yetkiniz bulunmamaktadır.</p>
      </div>
      <div className="flex gap-4 mt-4">
        <Link
          href="/dashboard"
          className="bg-gray-900 hover:bg-gray-700 px-6 py-2 rounded-md font-medium text-white text-sm transition-colors"
        >
          Dashboard&apos;a Git
        </Link>
        <Link
          href="/"
          className="hover:bg-gray-50 px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
