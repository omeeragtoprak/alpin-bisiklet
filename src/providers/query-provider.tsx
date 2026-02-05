"use client";

import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR ile birlikte kullanırken, client'ta hemen refetch yapılmasını önlemek için
        // staleTime'ı 0'dan büyük bir değere ayarlıyoruz
        staleTime: 60 * 1000, // 1 dakika
        // Hata durumunda otomatik retry
        retry: 1,
        // Pencere odağa geldiğinde refetch
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Mutation hataları için retry kapalı
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: her zaman yeni bir query client oluştur
    return makeQueryClient();
  }

  // Browser: mevcut client'ı kullan veya yeni oluştur
  // Bu önemli çünkü React initial render sırasında suspend olursa
  // yeni bir client oluşturulmasını önlüyoruz
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // NOT: useState kullanmaktan kaçının eğer suspense boundary yoksa
  // çünkü React initial render'da suspend olursa client'ı atacaktır
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Development modunda devtools göster */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
