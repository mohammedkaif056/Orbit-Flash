"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

interface TestimonialsProps {
  className?: string;
  autoAdvanceInterval?: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "OrbitFlash transformed our DeFi operations with lightning-fast cross-chain swaps. The user experience is simply unmatched.",
    author: "Sarah Chen",
    role: "Head of DeFi at Nexus Protocol",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "The security features and institutional-grade infrastructure gave us the confidence to migrate our entire treasury operations.",
    author: "Marcus Rodriguez",
    role: "CTO at BlockVault",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "Outstanding performance and reliability. Our trading volume increased 300% after integrating OrbitFlash's infrastructure.",
    author: "Dr. Aisha Patel",
    role: "Founder of QuantumTrade",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
];

export default function Testimonials({ className = "", autoAdvanceInterval = 6000 }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToTestimonial = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (prefersReducedMotion || isHovered || isFocused || testimonials.length <= 1) {
      return;
    }

    const interval = setInterval(nextTestimonial, autoAdvanceInterval);
    return () => clearInterval(interval);
  }, [nextTestimonial, autoAdvanceInterval, prefersReducedMotion, isHovered, isFocused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevTestimonial();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextTestimonial();
          break;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isFocused, prevTestimonial, nextTestimonial]);

  // Motion variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const transition = prefersReducedMotion 
    ? { duration: 0 } 
    : { type: "tween", ease: "easeInOut", duration: 0.3 };

  if (testimonials.length === 0) {
    return (
      <section className={`py-16 bg-card ${className}`}>
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
            What Our Users Say
          </h2>
          <div className="text-muted-foreground">
            Customer stories coming soon
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`py-16 bg-card ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={-1}
    >
      <div className="container max-w-4xl mx-auto px-6">
        <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
          What Our Users Say
        </h2>

        <div className="relative">
          {/* Main testimonial content */}
          <div 
            className="relative h-64 md:h-48 overflow-hidden"
            aria-live="polite"
            aria-label="Testimonial carousel"
          >
            <AnimatePresence mode="wait" custom={currentIndex}>
              <motion.div
                key={currentIndex}
                custom={currentIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="absolute inset-0 flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
              >
                {/* Avatar */}
                {testimonials[currentIndex].avatar && (
                  <div className="flex-shrink-0">
                    <img
                      src={testimonials[currentIndex].avatar}
                      alt={`${testimonials[currentIndex].author} avatar`}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <blockquote className="text-lg md:text-xl text-foreground mb-4 leading-relaxed">
                    "{testimonials[currentIndex].quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonials[currentIndex].author}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {testimonials[currentIndex].role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pager dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                    index === currentIndex 
                      ? "bg-primary" 
                      : "bg-muted hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : "false"}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screen reader only: current position */}
        <div className="sr-only" aria-live="polite">
          Showing testimonial {currentIndex + 1} of {testimonials.length}
        </div>
      </div>
    </section>
  );
}