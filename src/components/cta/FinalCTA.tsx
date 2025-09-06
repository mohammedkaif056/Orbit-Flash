"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WalletMinimal, Play } from "lucide-react";
import { useConnect, useAccount } from "wagmi";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

interface FinalCTAProps {
  className?: string;
}

export default function FinalCTA({ className }: FinalCTAProps) {
  const { connect, isPending, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const [showHelp, setShowHelp] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for animation performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Check for motion preference
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

  const handleConnect = async () => {
    if (isConnected) {
      toast.success("Wallet already connected!");
      return;
    }

    const injectedConnector = connectors.find(c => c.type === "injected");
    
    if (!injectedConnector) {
      setShowHelp(true);
      toast.error("No wallet detected. Please install a Web3 wallet.");
      return;
    }

    try {
      await connect({ connector: injectedConnector });
      toast.success("Wallet connected successfully!");
      setShowHelp(false);
    } catch (error) {
      console.error("Connection failed:", error);
      setShowHelp(true);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const handleDemo = () => {
    toast.info("Demo mode activated - explore without connecting!");
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const backgroundAnimation = !prefersReducedMotion && isInView ? {
    scale: [1, 1.02, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  } : {};

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-labelledby="final-cta-heading"
      className={`relative py-24 px-6 overflow-hidden ${className}`}
    >
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-3xl"
        animate={backgroundAnimation}
        style={{ transformOrigin: "center center" }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 
            id="final-cta-heading"
            className="font-heading text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
          >
            Ready to Launch?
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Join thousands of creators building the future of decentralized applications with OrbitFlash.
          </p>
        </motion.div>

        {/* Connection status */}
        {isConnected && address && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Connected: {formatAddress(address)}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={handleConnect}
            disabled={isPending}
            aria-label={isConnected ? "Wallet already connected" : "Connect your Web3 wallet to get started"}
            className="group relative px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <WalletMinimal className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            {isPending ? "Connecting..." : isConnected ? "Connected!" : "Get Started — Connect Wallet"}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleDemo}
            aria-label="Try the demo version without connecting a wallet"
            className="px-8 py-6 text-lg font-medium bg-transparent border-border hover:bg-muted/50 transition-all duration-200"
          >
            <Play className="w-5 h-5 mr-2" />
            Try Demo
          </Button>
        </motion.div>

        {/* Help panel */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-6 bg-card border border-border rounded-lg text-left space-y-3"
          >
            <h3 className="font-semibold text-foreground">Need a Web3 Wallet?</h3>
            <p className="text-sm text-muted-foreground">
              To get started, you'll need a Web3 wallet like MetaMask, Coinbase Wallet, or WalletConnect.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-xs"
              >
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download MetaMask wallet (opens in new tab)"
                >
                  Get MetaMask
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-xs"
              >
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Coinbase Wallet (opens in new tab)"
                >
                  Get Coinbase Wallet
                </a>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowHelp(false)}
                className="text-xs"
                aria-label="Close help panel"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}