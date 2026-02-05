import { PageSkeleton } from "@/components/skeletons";

/**
 * Global Loading State
 * Sayfa yüklenirken gösterilen bekleme ekranı
 * React Suspense ile otomatik olarak sarmalanır
 */
export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <PageSkeleton />
    </div>
  );
}
