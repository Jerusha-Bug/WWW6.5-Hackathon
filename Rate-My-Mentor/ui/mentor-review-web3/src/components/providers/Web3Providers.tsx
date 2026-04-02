"use client";

import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

// 动态导入 RainbowKit，禁用 SSR
const RainbowKitProvider = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.RainbowKitProvider),
  { ssr: false }
);

// 动态导入 WagmiProvider，禁用 SSR
const WagmiProvider = dynamic(
  () => import("wagmi").then((mod) => mod.WagmiProvider),
  { ssr: false }
);

import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

function ProvidersInner({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Web3Providers({ children }: { children: ReactNode }) {
  return <ProvidersInner>{children}</ProvidersInner>;
}
