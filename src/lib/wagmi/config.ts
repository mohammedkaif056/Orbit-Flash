import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum } from 'wagmi/chains'
import { QueryClient } from '@tanstack/react-query'

// Environment variables with fallbacks
const getWalletConnectProjectId = (): string => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
                   process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ||
                   process.env.VITE_WALLETCONNECT_PROJECT_ID

  if (!projectId && process.env.NODE_ENV === 'production') {
    console.error('WalletConnect Project ID is required for production')
  }

  // Fallback project ID for development (from WalletConnect docs)
  return projectId || '2f05a7d9c8b64c6c9b8c4a1e2f05a7d9'
}

const getRpcUrl = (chainId: number): string => {
  const envKey = chainId === mainnet.id ? 'ETHEREUM_RPC_URL' : 'ARBITRUM_RPC_URL'
  
  const rpcUrl = process.env[`NEXT_PUBLIC_${envKey}`] || 
                 process.env[`REACT_APP_${envKey}`] ||
                 process.env[`VITE_${envKey}`]

  if (rpcUrl) return rpcUrl

  // Fallback public RPC URLs
  const fallbacks: Record<number, string> = {
    [mainnet.id]: 'https://eth.llamarpc.com',
    [arbitrum.id]: 'https://arb1.arbitrum.io/rpc'
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`Using fallback RPC URL for chain ${chainId}. Consider setting ${envKey} environment variable.`)
  }

  return fallbacks[chainId] || fallbacks[mainnet.id]
}

// Chain configurations with custom RPC endpoints
const chains = [
  {
    ...mainnet,
    rpcUrls: {
      ...mainnet.rpcUrls,
      default: {
        http: [getRpcUrl(mainnet.id)]
      }
    }
  },
  {
    ...arbitrum,
    rpcUrls: {
      ...arbitrum.rpcUrls,
      default: {
        http: [getRpcUrl(arbitrum.id)]
      }
    }
  }
] as const

// Connector configurations - RainbowKit will handle connectors
const connectors = []

// Transport configuration with error handling
const transports = {
  [mainnet.id]: http(getRpcUrl(mainnet.id), {
    batch: true,
    retryCount: 3,
    retryDelay: 1000
  }),
  [arbitrum.id]: http(getRpcUrl(arbitrum.id), {
    batch: true,
    retryCount: 3,
    retryDelay: 1000
  })
}

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
  ssr: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  multiInjectedProviderDiscovery: true
})

// Query client for React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry if it's a user rejection
        if (error?.message?.includes('rejected') || error?.message?.includes('denied')) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: false
    }
  }
})

// Type exports for TypeScript
export type WagmiConfig = typeof wagmiConfig
export type SupportedChains = (typeof chains)[number]

// Utility functions for chain detection
export const isSupportedChain = (chainId: number): boolean => {
  return chains.some(chain => chain.id === chainId)
}

export const getSupportedChainIds = (): number[] => {
  return chains.map(chain => chain.id)
}

// Environment validation helper
export const validateEnvironment = (): void => {
  const projectId = getWalletConnectProjectId()
  
  if (process.env.NODE_ENV === 'production' && (!projectId || projectId.length < 10)) {
    throw new Error('Invalid WalletConnect Project ID. Please check your environment variables.')
  }

  // Validate RPC URLs in production
  if (process.env.NODE_ENV === 'production') {
    chains.forEach(chain => {
      const rpcUrl = getRpcUrl(chain.id)
      if (!rpcUrl.startsWith('https://')) {
        console.warn(`Insecure RPC URL detected for chain ${chain.id}: ${rpcUrl}`)
      }
    })
  }
}

// Initialize validation
if (typeof window !== 'undefined') {
  try {
    validateEnvironment()
  } catch (error) {
    console.error('Wagmi configuration validation failed:', error)
  }
}