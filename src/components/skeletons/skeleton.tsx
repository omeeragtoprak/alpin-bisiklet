import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton Bileşeni
 * Animasyonlu placeholder için kullanılır
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("bg-gray-200 rounded-md animate-pulse", className)} />;
}
