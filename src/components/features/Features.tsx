"use client";

import { useState, useCallback } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { Component, LayoutGrid, CreditCard, Zap, ArrowRight } from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  features?: Feature[];
  className?: string;
}

const defaultFeatures: Feature[] = [
  {
    id: 'fast-relays',
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast TX Relays',
    description: 'Process cross-chain transactions with sub-second finality through our optimized relay network.',
  },
  {
    id: 'cross-chain',
    icon: <LayoutGrid className="h-6 w-6" />,
    title: 'Seamless Cross-Chain Sync',
    description: 'Synchronize assets and data across multiple blockchains with automated bridging protocols.',
  },
  {
    id: 'dashboard',
    icon: <Component className="h-6 w-6" />,
    title: 'Intuitive Dashboard',
    description: 'Monitor your multi-chain portfolio with real-time analytics and transaction insights.',
  },
];

interface FeatureCardProps {
  feature: Feature;
  index: number;
  onClick: (feature: Feature) => void;
  shouldReduceMotion: boolean;
}

function FeatureCard({ feature, index, onClick, shouldReduceMotion }: FeatureCardProps) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(feature);
    }
  }, [feature, onClick]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: [0.21, 1.11, 0.81, 0.99]
      }
    }
  };

  const hoverVariants = shouldReduceMotion ? {} : {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  };

  return (
    <motion.article
      className="group relative bg-card border border-border rounded-lg p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background will-change-transform"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      whileHover={hoverVariants}
      whileFocus={hoverVariants}
      tabIndex={0}
      role="article"
      aria-describedby={`feature-${feature.id}-desc`}
      onKeyDown={handleKeyDown}
      onClick={() => onClick(feature)}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
            {feature.title}
          </h3>
        </div>
        
        <p 
          id={`feature-${feature.id}-desc`}
          className="text-muted-foreground text-sm leading-relaxed"
        >
          {feature.description}
        </p>

        <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
          <span>Learn more</span>
          <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.article>
  );
}

function FeatureCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="h-5 bg-muted rounded w-32" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}

export default function Features({ features = defaultFeatures, className = "" }: FeaturesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleFeatureClick = useCallback((feature: Feature) => {
    setSelectedFeature(feature);
    // Simulate opening a detail drawer or modal
    console.log('Feature selected:', feature.title);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        staggerChildren: shouldReduceMotion ? 0 : 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <section className={`py-16 px-4 ${className}`} aria-label="Features loading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <FeatureCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!features || features.length === 0) {
    return (
      <section className={`py-16 px-4 ${className}`} aria-label="No features available">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Features Available</h3>
            <p className="text-muted-foreground">Features will be displayed here once they're loaded.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 px-4 ${className}`} aria-label="Product features">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for the next generation of decentralized applications with enterprise-grade performance and security.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              onClick={handleFeatureClick}
              shouldReduceMotion={!!shouldReduceMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}