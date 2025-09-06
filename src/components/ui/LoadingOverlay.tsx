"use client";

import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

interface LoadingOverlayProps {
  /** Message to display below the spinner */
  message?: string;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the overlay covers the full screen or is scoped to its container */
  fullScreen?: boolean;
  /** Whether to trap focus within the overlay */
  trapFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function LoadingOverlay({
  message = "Loading visuals…",
  size = 'md',
  fullScreen = false,
  trapFocus = false,
  className = "",
}: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Set inert attribute on body children when overlay is active and full screen
    if (fullScreen && typeof document !== 'undefined') {
      const body = document.body;
      const children = Array.from(body.children) as HTMLElement[];
      const overlay = document.querySelector('[data-loading-overlay]') as HTMLElement;
      
      children.forEach(child => {
        if (child !== overlay) {
          child.setAttribute('inert', '');
        }
      });
      
      return () => {
        children.forEach(child => {
          child.removeAttribute('inert');
        });
      };
    }
  }, [fullScreen]);
  
  // Focus trap effect for accessibility
  useEffect(() => {
    if (!trapFocus || !mounted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault(); // Prevent tab navigation when trapped
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus, mounted]);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  if (!mounted) return null;
  
  return (
    <div
      data-loading-overlay
      className={`
        ${fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0'}
        flex items-center justify-center
        bg-background/80 backdrop-blur-sm
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle 
          className={`
            ${sizeClasses[size]} 
            text-primary
            motion-safe:animate-spin
            motion-reduce:animate-pulse
          `}
          aria-hidden="true"
        />
        
        {message && (
          <p 
            className={`
              ${textSizeClasses[size]} 
              text-muted-foreground 
              font-medium
              max-w-xs
            `}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}