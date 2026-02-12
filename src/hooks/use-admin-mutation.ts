"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface UseAdminMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: string[][];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData) => void;
}

export function useAdminMutation<TData = unknown, TVariables = void>({
  mutationFn,
  invalidateKeys = [],
  successMessage = "Islem basarili",
  errorMessage = "Bir hata olustu",
  onSuccess,
}: UseAdminMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast({ title: successMessage });
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: errorMessage,
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
