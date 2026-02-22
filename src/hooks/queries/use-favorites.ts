import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { QUERY_KEYS } from "@/constants/query-keys";

interface FavoriteItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: Array<{ url: string; alt: string | null }>;
    category: { name: string } | null;
  };
}

interface FavoritesResponse {
  data: FavoriteItem[];
}

/** Favori listesini döner — /hesabim/favorilerim sayfasında kullanılır */
export function useFavorites() {
  const { data: session } = authClient.useSession();

  return useQuery<FavoritesResponse>({
    queryKey: QUERY_KEYS.favorites.list(),
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Favoriler yüklenemedi");
      return res.json();
    },
    enabled: !!session?.user,
  });
}

/** Favori ürün ID'lerini Set olarak döner — product card'larda hızlı kontrol için */
export function useFavoriteIds(): Set<number> {
  const { data: session } = authClient.useSession();

  const { data } = useQuery<FavoritesResponse>({
    queryKey: QUERY_KEYS.favorites.list(),
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Favoriler yüklenemedi");
      return res.json();
    },
    enabled: !!session?.user,
    staleTime: 30_000,
  });

  return new Set<number>((data?.data ?? []).map((f) => f.productId));
}

/** Favori ekle/çıkar toggle mutation */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("İşlem başarısız");
      return res.json() as Promise<{ data: FavoriteItem | null; removed: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites.all });
    },
  });
}
