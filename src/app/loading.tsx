/**
 * Global Loading State
 * Sayfa yüklenirken gösterilen bekleme ekranı
 * React Suspense ile otomatik olarak sarmalanır
 */
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="border-4 border-gray-200 border-t-gray-900 rounded-full w-12 h-12 animate-spin" />
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    </div>
  );
}
