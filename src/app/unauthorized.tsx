import Link from "next/link";

/**
 * 401 - Yetkisiz Erişim
 * Giriş yapılmadan korunan sayfalara erişildiğinde gösterilir
 * unauthorized() fonksiyonu çağrıldığında render edilir
 */
export default function Unauthorized() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 min-h-screen">
      <div className="text-center">
        <h1 className="font-bold text-gray-900 text-6xl">401</h1>
        <h2 className="mt-2 font-semibold text-gray-700 text-2xl">Yetkisiz Erişim</h2>
        <p className="mt-2 text-gray-500">Bu sayfaya erişmek için giriş yapmanız gerekmektedir.</p>
      </div>
      <div className="flex gap-4 mt-4">
        <Link
          href="/giris"
          className="bg-gray-900 hover:bg-gray-700 px-6 py-2 rounded-md font-medium text-white text-sm transition-colors"
        >
          Giriş Yap
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
