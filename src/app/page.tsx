"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/hero/Hero";
import Features from "../components/features/Features";
import VisualSection from "../components/visuals/VisualSection";
import Testimonials from "../components/testimonials/Testimonials";
import FinalCTA from "../components/cta/FinalCTA";
import LoadingOverlay from "../components/ui/LoadingOverlay";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Navigation */}
      <Navbar />
      
      {/* Main Content Area */}
      <main 
        id="main-content"
        role="main" 
        className="pt-20"
      >
        {/* Hero Section - Full viewport */}
        <section id="hero" className="min-h-screen">
          <Suspense fallback={<LoadingOverlay message="Loading hero section..." fullScreen />}>
            <Hero />
          </Suspense>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-background py-16">
          <div className="container mx-auto px-6">
            <Features />
          </div>
        </section>

        {/* Visual Section */}
        <section id="visual" className="bg-muted/30">
          <VisualSection />
        </section>

        {/* Testimonials Section */}
        <section className="bg-card/50">
          <Testimonials />
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="bg-background">
          <div className="container mx-auto">
            <FinalCTA />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}