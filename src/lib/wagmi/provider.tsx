"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { 
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  injectedWallet,
  rainbowWallet
} from '@rainbow-me/rainbowkit/wallets';
import { wagmiConfig, queryClient } from './config';

// Get WalletConnect project ID
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

// Configure connectors for RainbowKit
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        rainbowWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'OrbitFlash',
    projectId: getWalletConnectProjectId(),
  }
);

// Error Boundary Component
class WagmiErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WagmiProviders Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="text-destructive text-sm font-medium mb-2">
              Web3 Connection Error
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Unable to initialize wallet providers. Some features may be limited.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom RainbowKit theme matching design system
const customDarkTheme = darkTheme({
  accentColor: '#9b8cff', // primary color
  accentColorForeground: '#0b0c10', // primary-foreground
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

// Merge with additional custom styles
const rainbowKitTheme = {
  ...customDarkTheme,
  colors: {
    ...customDarkTheme.colors,
    modalBackground: '#17181d', // card color
    modalBorder: '#2a2d31', // border color
    modalText: '#f5f7fa', // foreground color
    modalTextSecondary: '#8a8f99', // muted-foreground
    profileAction: '#202227', // secondary color
    profileActionHover: '#1f2126', // muted color
    profileForeground: '#f5f7fa', // foreground
    selectedOptionBorder: '#9b8cff', // primary
    connectButtonBackground: '#9b8cff', // primary
    connectButtonBackgroundError: '#ef4444', // destructive
    connectButtonInnerBackground: '#202227', // secondary
    connectButtonText: '#f5f7fa', // foreground
    connectButtonTextError: '#f5f7fa', // foreground
    connectionIndicator: '#22c55e', // success green
    downloadBottomCardBackground: '#17181d', // card
    downloadTopCardBackground: '#1f2126', // muted
    error: '#ef4444', // destructive
    generalBorder: '#2a2d31', // border
    generalBorderDim: '#26292e', // sidebar-border
    menuItemBackground: '#202227', // secondary
    modalBackdrop: 'rgba(14, 15, 19, 0.8)', // background with opacity
    standby: '#8a8f99', // muted-foreground
  },
};

// Hydration-safe wrapper
function HydrationSafeWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Environment validation
function validateEnvironment() {
  const issues: string[] = [];

  // Check for required environment variables
  if (typeof window !== 'undefined') {
    const requiredEnvVars = ['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'];
    
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        issues.push(`Missing environment variable: ${envVar}`);
      }
    });
  }

  // Validate wagmi config
  if (!wagmiConfig) {
    issues.push('wagmiConfig is not properly initialized');
  }

  // Validate query client
  if (!queryClient) {
    issues.push('queryClient is not properly initialized');
  }

  return issues;
}

// Main provider component
export const WagmiProviders = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Validate environment on mount (client-side only)
    const issues = validateEnvironment();
    if (issues.length > 0) {
      console.warn('WagmiProviders validation issues:', issues);
    }
  }, []);

  return (
    <WagmiErrorBoundary>
      <HydrationSafeWrapper>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider 
              connectors={connectors}
              theme={rainbowKitTheme}
              modalSize="compact"
              initialChain={wagmiConfig.chains[0]}
              showRecentTransactions={true}
              coolMode={false}
              locale="en-US"
            >
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </HydrationSafeWrapper>
    </WagmiErrorBoundary>
  );
};

// Export default for convenience
export default WagmiProviders;