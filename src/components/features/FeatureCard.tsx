"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  onActivate?: () => void;
  className?: string;
}

export default function FeatureCard({
  title = "Feature",
  description = "",
  icon,
  onActivate,
  className = "",
}: FeatureCardProps) {
  const isClickable = Boolean(onActivate);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isClickable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onActivate?.();
    }
  };

  const cardProps = isClickable
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick: onActivate,
        onKeyDown: handleKeyDown,
        "aria-label": `${title} feature`,
      }
    : {};

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-lg border border-border bg-card p-6
        transition-all duration-200 ease-out
        ${isClickable ? "cursor-pointer" : ""}
        ${isClickable ? "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" : ""}
        ${className}
      `}
      whileHover={
        isClickable
          ? {
              y: -2,
              boxShadow: "0 10px 30px -4px rgba(0, 0, 0, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }
          : undefined
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...cardProps}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary"
          whileHover={isClickable ? { y: -1 } : undefined}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {icon}
        </motion.div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-heading text-lg font-semibold text-card-foreground leading-tight">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Subtle hover accent line */}
      {isClickable && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-primary"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}