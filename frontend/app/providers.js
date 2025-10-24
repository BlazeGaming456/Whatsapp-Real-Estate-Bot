"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WhatsAppProvider } from "../contexts/WhatsAppContext";

/**
 * Providers component that wraps the app with necessary context providers
 * This includes React Query for data fetching and caching, and WhatsApp context
 */
export function Providers({ children }) {
  // Create a QueryClient instance for React Query
  // This handles caching, background updates, and error handling
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // How long to consider data fresh (in milliseconds)
            staleTime: 60 * 1000, // 1 minute
            // How long to keep data in cache when unused
            gcTime: 5 * 60 * 1000, // 5 minutes
            // Retry failed requests
            retry: 2,
            // Don't refetch on window focus
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WhatsAppProvider>{children}</WhatsAppProvider>
    </QueryClientProvider>
  );
}
