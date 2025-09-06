import { Copyright } from "lucide-react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer 
      role="contentinfo" 
      className={`w-full bg-background border-t border-border py-8 ${className}`}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Copyright and Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Copyright className="h-4 w-4" />
              <span>© 2025 OrbitFlash</span>
            </div>
            
            <nav className="flex items-center gap-6" role="navigation" aria-label="Footer links">
              <a
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1 py-0.5"
                aria-label="Privacy Policy"
                rel="noopener noreferrer"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1 py-0.5"
                aria-label="Terms of Service"
                rel="noopener noreferrer"
              >
                Terms
              </a>
              <a
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1 py-0.5"
                aria-label="Contact Us"
                rel="noopener noreferrer"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Developer Integration Hint */}
          <div className="text-xs text-muted-foreground/70 font-mono">
            Connect via /api/opportunities
          </div>
        </div>
      </div>
    </footer>
  );
}