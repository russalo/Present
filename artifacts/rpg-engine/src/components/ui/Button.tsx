import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-primary/90 text-primary-foreground border border-primary/50 hover:bg-primary shadow-[0_0_15px_rgba(200,160,100,0.15)] hover:shadow-[0_0_20px_rgba(200,160,100,0.3)]",
      secondary: "bg-secondary text-foreground border border-border hover:bg-secondary/80 hover:border-primary/30",
      ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
      destructive: "bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-[0_0_15px_rgba(200,30,30,0.2)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-lg font-display tracking-widest uppercase",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
