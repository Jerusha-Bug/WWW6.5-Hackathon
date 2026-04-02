import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { avalancheFuji } from 'wagmi/chains'

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
  ],
  transports: {
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
  },
})