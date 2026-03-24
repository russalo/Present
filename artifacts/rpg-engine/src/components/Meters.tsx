import React from "react";
import { cn } from "@/lib/utils";

export function TensionMeter({ tension }: { tension: number }) {
  // tension is 0-10
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-end">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-display font-bold">World Tension</span>
        <span className="text-xs font-mono text-muted-foreground">{tension}/10</span>
      </div>
      <div className="flex space-x-1 w-full h-2.5 bg-black/40 rounded-sm p-0.5 border border-border/50">
        {Array.from({ length: 10 }).map((_, i) => {
          const isActive = i < tension;
          let colorClass = "bg-transparent";
          let glowClass = "";

          if (isActive) {
            if (i < 4) {
              colorClass = "bg-emerald-500/80";
              glowClass = "shadow-[0_0_8px_rgba(16,185,129,0.4)]";
            } else if (i < 7) {
              colorClass = "bg-amber-500/80";
              glowClass = "shadow-[0_0_8px_rgba(245,158,11,0.5)]";
            } else {
              colorClass = "bg-red-500/90";
              glowClass = "shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse-slow";
            }
          }

          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-[1px] transition-all duration-500",
                isActive ? colorClass : "bg-white/5",
                glowClass
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export function RelationBar({ relation }: { relation: number }) {
  // relation is -10 to 10
  const normalized = (relation + 10) / 20; // 0 to 1
  const percentage = normalized * 100;
  
  let color = "bg-gray-500";
  if (relation < -3) color = "bg-red-500";
  else if (relation > 3) color = "bg-emerald-500";
  else color = "bg-amber-500";

  return (
    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-border">
      <div 
        className={cn("h-full transition-all duration-1000 ease-out", color)} 
        style={{ width: `${percentage}%` }} 
      />
    </div>
  );
}
