"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Layers2, Framer, PanelRight } from "lucide-react";

interface VisualSectionProps {
  className?: string;
}

// Custom hook for motion preferences
function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const systemPreference = useReducedMotion();

  useEffect(() => {
    const stored = localStorage.getItem('orbitflash-reduced-motion');
    if (stored) {
      setPrefersReducedMotion(stored === 'true');
    } else {
      setPrefersReducedMotion(systemPreference || false);
    }
  }, [systemPreference]);

  const toggleMotion = () => {
    const newValue = !prefersReducedMotion;
    setPrefersReducedMotion(newValue);
    localStorage.setItem('orbitflash-reduced-motion', String(newValue));
  };

  return { prefersReducedMotion, toggleMotion };
}

// Lazy GSAP loader hook
function useLazyGSAP() {
  const [gsap, setGsap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadGSAP = async () => {
    if (gsap || isLoading) return gsap;
    
    // Check device performance heuristics
    const isHighPerformance = 
      window.navigator.hardwareConcurrency >= 4 &&
      window.devicePixelRatio <= 2 &&
      !window.navigator.userAgent.includes('Mobile');

    if (!isHighPerformance) {
      console.log('[VisualSection] Skipping GSAP on low-performance device');
      return null;
    }

    setIsLoading(true);
    
    try {
      const { gsap: gsapLib } = await import('gsap');
      setGsap(gsapLib);
      return gsapLib;
    } catch (error) {
      console.warn('[VisualSection] GSAP failed to load, using CSS fallback', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { gsap, loadGSAP, isLoading };
}

// Default CSS/SVG animated illustration
function DefaultVisual({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        aria-hidden="true"
      >
        {/* Floating shapes with CSS animations */}
        <circle
          cx="100"
          cy="100"
          r="20"
          fill="var(--color-primary)"
          opacity="0.6"
          className={prefersReducedMotion ? "" : "animate-pulse"}
          style={{
            animationDelay: '0s',
            animationDuration: '3s'
          }}
        />
        <circle
          cx="300"
          cy="150"
          r="15"
          fill="var(--color-accent)"
          opacity="0.4"
          className={prefersReducedMotion ? "" : "animate-pulse"}
          style={{
            animationDelay: '1s',
            animationDuration: '4s'
          }}
        />
        <rect
          x="200"
          y="250"
          width="30"
          height="30"
          fill="var(--color-chart-3)"
          opacity="0.5"
          rx="4"
          className={prefersReducedMotion ? "" : "animate-pulse"}
          style={{
            animationDelay: '2s',
            animationDuration: '3.5s'
          }}
        />
        
        {/* Connecting lines */}
        <path
          d="M 120 100 Q 200 50 280 150"
          stroke="var(--color-primary)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
          className={prefersReducedMotion ? "" : "animate-pulse"}
          style={{
            animationDelay: '0.5s',
            animationDuration: '2s'
          }}
        />
        <path
          d="M 220 250 Q 250 200 300 165"
          stroke="var(--color-accent)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
          className={prefersReducedMotion ? "" : "animate-pulse"}
          style={{
            animationDelay: '1.5s',
            animationDuration: '2.5s'
          }}
        />
      </svg>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      
      {/* Central icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-6 rounded-full bg-card/50 border border-border backdrop-blur-sm">
          <Layers2 className="w-12 h-12 text-primary" />
        </div>
      </div>
    </div>
  );
}

// Enhanced GSAP visual (loaded dynamically)
function EnhancedVisual({ gsap, prefersReducedMotion }: { gsap: any; prefersReducedMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "0px 0px -100px 0px" });

  useEffect(() => {
    if (!gsap || !containerRef.current || prefersReducedMotion || !isInView) return;

    const container = containerRef.current;
    const shapes = container.querySelectorAll('.gsap-shape');
    
    // Enhanced morphing animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    shapes.forEach((shape, index) => {
      tl.to(shape, {
        scale: gsap.utils.random(0.8, 1.4),
        rotation: gsap.utils.random(-180, 180),
        x: gsap.utils.random(-50, 50),
        y: gsap.utils.random(-30, 30),
        duration: gsap.utils.random(2, 4),
        ease: "power2.inOut"
      }, index * 0.2);
    });

    return () => {
      tl.kill();
    };
  }, [gsap, prefersReducedMotion, isInView]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-96 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-border"
    >
      <div className="absolute inset-4">
        <div className="gsap-shape absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-primary opacity-60" />
        <div className="gsap-shape absolute top-1/3 right-1/4 w-6 h-6 rounded bg-accent opacity-50" />
        <div className="gsap-shape absolute bottom-1/3 left-1/3 w-10 h-4 rounded-full bg-chart-3 opacity-40" />
        <div className="gsap-shape absolute bottom-1/4 right-1/3 w-5 h-5 rounded bg-chart-4 opacity-45" />
      </div>
      
      {/* Central enhanced icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-8 rounded-full bg-card/60 border border-primary/30 backdrop-blur-sm">
          <Framer className="w-16 h-16 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function VisualSection({ className = "" }: VisualSectionProps) {
  const { prefersReducedMotion, toggleMotion } = useMotionPreference();
  const { gsap, loadGSAP, isLoading } = useLazyGSAP();
  const [showEnhanced, setShowEnhanced] = useState(false);
  
  const textRef = useRef(null);
  const visualRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "0px 0px -100px 0px" });
  const visualInView = useInView(visualRef, { once: true, margin: "0px 0px -100px 0px" });

  // Load enhanced visual when in view
  useEffect(() => {
    if (visualInView && !prefersReducedMotion && !gsap && !isLoading) {
      loadGSAP().then((loadedGsap) => {
        if (loadedGsap) {
          setShowEnhanced(true);
        }
      });
    }
  }, [visualInView, prefersReducedMotion, gsap, loadGSAP, isLoading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <section 
      className={`relative py-24 lg:py-32 ${className}`}
      aria-labelledby="visual-section-heading"
    >
      <div className="container mx-auto px-6">
        {/* Motion preference toggle */}
        <div className="absolute top-8 right-8 z-10">
          <button
            onClick={toggleMotion}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border border-border bg-card/50 backdrop-blur-sm"
            aria-label={prefersReducedMotion ? "Enable animations" : "Reduce motion"}
          >
            <PanelRight className="w-4 h-4" />
            {prefersReducedMotion ? "Enable Motion" : "Reduce Motion"}
          </button>
        </div>

        <motion.div
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          variants={prefersReducedMotion ? {} : containerVariants}
          initial="hidden"
          animate={textInView ? "visible" : "hidden"}
        >
          {/* Text Content */}
          <motion.div
            ref={textRef}
            className="space-y-8"
            variants={prefersReducedMotion ? {} : slideInLeft}
          >
            <div className="space-y-6">
              <motion.h2
                id="visual-section-heading"
                className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight"
                variants={prefersReducedMotion ? {} : slideInLeft}
              >
                Lightning-Fast
                <span className="block text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                  Web3 Execution
                </span>
              </motion.h2>
              
              <motion.p
                className="text-xl text-muted-foreground leading-relaxed"
                variants={prefersReducedMotion ? {} : slideInLeft}
              >
                Experience the future of decentralized applications with our optimized infrastructure and advanced transaction handling.
              </motion.p>
            </div>

            <motion.div
              className="space-y-6"
              variants={prefersReducedMotion ? {} : slideInLeft}
            >
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Key Advantages
              </h3>
              
              <ol className="space-y-4" role="list">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-1">
                    <span className="text-sm font-medium text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Sub-Second Transactions</h4>
                    <p className="text-muted-foreground">Advanced batching and optimization for instant execution</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mt-1">
                    <span className="text-sm font-medium text-accent-foreground">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Minimal Gas Fees</h4>
                    <p className="text-muted-foreground">Smart routing to reduce transaction costs by up to 90%</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-chart-3/20 border border-chart-3/30 flex items-center justify-center mt-1">
                    <span className="text-sm font-medium text-background">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Cross-Chain Compatible</h4>
                    <p className="text-muted-foreground">Seamless integration across multiple blockchain networks</p>
                  </div>
                </li>
              </ol>
            </motion.div>
          </motion.div>

          {/* Visual Area */}
          <motion.div
            ref={visualRef}
            className="relative"
            variants={prefersReducedMotion ? {} : slideInRight}
          >
            {showEnhanced && gsap ? (
              <EnhancedVisual gsap={gsap} prefersReducedMotion={prefersReducedMotion} />
            ) : (
              <DefaultVisual prefersReducedMotion={prefersReducedMotion} />
            )}
            
            {/* Loading indicator for enhanced visual */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                <div className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-md">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Enhancing visualization...</span>
                </div>
              </div>
            )}
            
            {/* Accessibility description for screen readers */}
            <div className="sr-only">
              Animated visualization showing interconnected nodes and data flow representing OrbitFlash's fast transaction processing and cross-chain capabilities.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}