"use client";

import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useAccount, useConnect } from 'wagmi';
import { Wallet, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load the canvas component
const HeroCanvas = lazy(() => import('./HeroCanvas.lazy'));

interface HeroProps {
  className?: string;
}

// Loading overlay for canvas fallback
const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 flex items-center justify-center">
    <div className="w-32 h-32 border-2 border-primary/30 rounded-full animate-pulse" />
  </div>
);

// Static fallback for devices that can't handle WebGL
const StaticFallback: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-accent/20">
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full opacity-60"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="orbit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
          <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="150" r="80" fill="none" stroke="url(#orbit-gradient)" strokeWidth="2" opacity="0.8" />
      <circle cx="200" cy="150" r="120" fill="none" stroke="url(#orbit-gradient)" strokeWidth="1" opacity="0.6" />
      <circle cx="200" cy="150" r="160" fill="none" stroke="url(#orbit-gradient)" strokeWidth="1" opacity="0.4" />
      <circle cx="200" cy="150" r="4" fill="var(--color-primary)" opacity="0.9" />
    </svg>
  </div>
);

export default function Hero({ className = "" }: HeroProps) {
  const [shouldLoadCanvas, setShouldLoadCanvas] = useState(false);
  const [canvasError, setCanvasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  // Check device capabilities and viewport size
  useEffect(() => {
    const checkCapabilities = () => {
      const hasGoodHardware = navigator.hardwareConcurrency >= 4;
      const hasGoodConnection = !('connection' in navigator) || 
        !(navigator as any).connection?.saveData;
      const hasGoodViewport = window.innerWidth >= 900;
      
      if (hasGoodHardware && hasGoodConnection && hasGoodViewport) {
        setShouldLoadCanvas(true);
      }
    };

    // Use requestIdleCallback for non-essential capability checking
    if ('requestIdleCallback' in window) {
      requestIdleCallback(checkCapabilities);
    } else {
      setTimeout(checkCapabilities, 100);
    }
  }, []);

  // Intersection observer for canvas visibility management
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    const heroElement = document.getElementById('hero');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = useCallback(async () => {
    if (isConnected || walletConnected) {
      // Already connected, navigate to app
      toast.success("Welcome to OrbitFlash! 🚀");
      setWalletConnected(true);
      return;
    }

    try {
      const injectedConnector = connectors.find(connector => 
        connector.type === 'injected'
      );
      
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      } else {
        // Fallback to WalletConnect
        const walletConnectConnector = connectors.find(connector =>
          connector.type === 'walletConnect'
        );
        
        if (walletConnectConnector) {
          connect({ connector: walletConnectConnector });
        } else {
          toast.error("No wallet found. Please install a Web3 wallet or use WalletConnect.");
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  }, [isConnected, walletConnected, connect, connectors]);

  const handleLearnMore = useCallback(() => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCanvasError = useCallback(() => {
    setCanvasError(true);
    // Log analytics error (would be implemented in analytics.ts)
    console.error('Canvas failed to load');
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1] as const
      }
    }
  };

  const buttonVariants = {
    hover: shouldReduceMotion ? {} : {
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" as const }
    },
    tap: shouldReduceMotion ? {} : {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <section
      id="hero"
      role="region"
      aria-labelledby="hero-heading"
      className={`relative min-h-screen flex items-center justify-center bg-background overflow-hidden ${className}`}
    >
      {/* Canvas Background */}
      <div className="absolute inset-0 z-0">
        {shouldLoadCanvas && !canvasError ? (
          <Suspense fallback={<LoadingOverlay />}>
            <HeroCanvas 
              paused={!isVisible}
              prefersReducedMotion={!!shouldReduceMotion}
            />
          </Suspense>
        ) : (
          <StaticFallback />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight"
          >
            <span className="block">Flash Loans</span>
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Execute complex DeFi strategies in a single transaction. 
            Access unlimited liquidity without collateral, powered by smart contracts.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold min-w-[160px]"
                aria-label={isConnected ? "Launch OrbitFlash app" : "Connect wallet to get started"}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isPending ? "Connecting..." : isConnected ? "Launch App" : "Get Started"}
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLearnMore}
                className="text-foreground border border-border hover:bg-muted px-8 py-3 text-lg font-medium min-w-[160px]"
                aria-label="Learn more about flash loans"
              >
                <Play className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {isConnected || walletConnected 
              ? "✅ Wallet connected - Ready to flash!" 
              : "🚀 Web3 wallet required - Connect to unlock unlimited liquidity"
            }
          </motion.p>
        </motion.div>
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-[5]" />
    </section>
  );
}