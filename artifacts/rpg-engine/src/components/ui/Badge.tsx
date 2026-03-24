import { cn } from "@/lib/utils";
import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline" | "terminal";
}

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  const variants = {
    default: "bg-secondary text-secondary-foreground border-border",
    success: "bg-emerald-950/50 text-emerald-400 border-emerald-900/50",
    warning: "bg-amber-950/50 text-amber-400 border-amber-900/50",
    danger: "bg-red-950/50 text-red-400 border-red-900/50",
    outline: "bg-transparent border-border text-muted-foreground",
    terminal: "bg-accent/10 text-accent border-accent/20 font-mono",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors shadow-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
