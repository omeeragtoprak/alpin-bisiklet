import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { ActiveDiscount } from "@/lib/pricing";

interface DiscountItem {
  id: number;
  name: string;
  type: string;
  categoryId: number | null;
  value: number;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string } | null;
}

export function useActiveDiscounts() {
  return useQuery<{ data: ActiveDiscount[] }>({
    queryKey: QUERY_KEYS.discounts.active(),
    queryFn: () =>
      fetch(`${API_ENDPOINTS.DISCOUNTS}?isActive=true`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDiscounts() {
  return useQuery<{ data: DiscountItem[] }>({
    queryKey: QUERY_KEYS.discounts.lists(),
    queryFn: () => fetch(API_ENDPOINTS.DISCOUNTS).then((r) => r.json()),
    staleTime: 60 * 1000,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(API_ENDPOINTS.DISCOUNTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discounts.all });
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      fetch(API_ENDPOINTS.DISCOUNT(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discounts.all });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetch(API_ENDPOINTS.DISCOUNT(id), { method: "DELETE" }).then((r) =>
        r.json(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.discounts.all });
    },
  });
}
