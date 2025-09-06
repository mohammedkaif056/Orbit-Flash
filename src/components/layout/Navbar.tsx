"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, WalletMinimal } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "sonner";

// Motion preference hook
function useMotionPreference() {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setShouldAnimate(!mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setShouldAnimate(!e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  return shouldAnimate;
}

// Debounce utility
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  ) as T;

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const shouldAnimate = useMotionPreference();

  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Debounced scroll handler
  const handleScroll = useDebounce(() => {
    const scrolled = window.scrollY > 24;
    setIsScrolled(scrolled);
  }, 10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Handle wallet connection
  const handleConnect = useCallback(() => {
    const injectedConnector = connectors.find(
      (connector) => connector.type === "injected"
    );
    
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else {
      const walletConnectConnector = connectors.find(
        (connector) => connector.type === "walletConnect"
      );
      
      if (walletConnectConnector) {
        connect({ connector: walletConnectConnector });
      } else {
        toast.error("No wallet connector found — please install a Web3 wallet or try WalletConnect");
      }
    }
  }, [connect, connectors]);

  // Handle copy address
  const handleCopyAddress = useCallback(async () => {
    if (address && typeof window !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard");
        setIsWalletMenuOpen(false);
      } catch (error) {
        toast.error("Failed to copy address");
      }
    }
  }, [address]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsWalletMenuOpen(false);
    toast.success("Wallet disconnected");
  }, [disconnect]);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle smooth scroll for navigation links
  const handleNavClick = (href: string) => {
    if (typeof window !== "undefined") {
      const element = document.querySelector(href);
      if (element) {
        const shouldSmoothScroll = shouldAnimate;
        element.scrollIntoView({
          behavior: shouldSmoothScroll ? "smooth" : "auto",
        });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>

      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(14, 15, 19, 0.8)" : "rgba(14, 15, 19, 0)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <motion.div
                className="relative"
                animate={
                  shouldAnimate
                    ? {
                        rotate: [0, 360],
                      }
                    : {}
                }
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg
                  role="img"
                  aria-label="OrbitFlash logo"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-primary"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <circle cx="16" cy="16" r="4" fill="currentColor" />
                  <motion.circle
                    cx="28"
                    cy="16"
                    r="2"
                    fill="currentColor"
                    animate={
                      shouldAnimate
                        ? {
                            cx: [28, 16, 4, 16, 28],
                            cy: [16, 4, 16, 28, 16],
                          }
                        : {}
                    }
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </motion.div>
              <span className="font-heading font-bold text-xl text-foreground">
                OrbitFlash
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6">
                <li>
                  <button
                    onClick={() => handleNavClick("#features")}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("#visual")}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                  >
                    Visual
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("#cta")}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            {/* Right Area - Wallet + Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Wallet Control */}
              <div className="relative">
                {isConnecting ? (
                  <div
                    className="flex items-center space-x-2 px-4 py-2 bg-muted rounded-lg"
                    aria-live="polite"
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm text-muted-foreground">Connecting...</span>
                  </div>
                ) : isConnected && address ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                      aria-label="Wallet menu"
                      aria-expanded={isWalletMenuOpen}
                      aria-controls="wallet-menu"
                    >
                      <WalletMinimal className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatAddress(address)}</span>
                    </button>

                    <AnimatePresence>
                      {isWalletMenuOpen && (
                        <motion.div
                          id="wallet-menu"
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: shouldAnimate ? 0.2 : 0 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
                        >
                          <div className="p-2">
                            <button
                              onClick={handleCopyAddress}
                              className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200 focus:outline-none focus:bg-accent focus:text-accent-foreground"
                              aria-label="Copy wallet address"
                            >
                              Copy Address
                            </button>
                            <button
                              onClick={handleDisconnect}
                              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-200 focus:outline-none focus:bg-destructive/10"
                              aria-label="Disconnect wallet"
                            >
                              Disconnect
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={handleConnect}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    aria-label="Connect wallet"
                    title="Connect your Web3 wallet"
                  >
                    <WalletMinimal className="w-4 h-4" />
                    <span className="text-sm">Connect Wallet</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-md"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: shouldAnimate ? 0.3 : 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 border-t border-border mt-4">
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => handleNavClick("#features")}
                        className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Features
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavClick("#visual")}
                        className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Visual
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavClick("#cta")}
                        className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Get Started
                      </button>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Click outside handler for wallet menu */}
      {isWalletMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsWalletMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}