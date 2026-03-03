import { QueryClient } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC || 'https://sepolia.infura.io/v3/c1dd5018fe0c4ea7a7dc7949f804a6c8'),
  },
})

export const queryClient = new QueryClient()
