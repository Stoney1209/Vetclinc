'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setRedirectHandler } from '@/lib/api';
import { Toaster } from 'sonner';
import { SocketProvider } from '@/lib/socket';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const router = useRouter();

  useEffect(() => {
    setRedirectHandler((url) => router.push(url));
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
        <Toaster position="top-right" richColors />
      </SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
