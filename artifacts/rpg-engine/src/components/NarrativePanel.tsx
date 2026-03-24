import React, { useEffect, useRef } from "react";
import { Turn } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface NarrativePanelProps {
  turns: Turn[];
  isThinking: boolean;
}

export function NarrativePanel({ turns, isThinking }: NarrativePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [turns, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative" ref={scrollRef}>
      {/* Background seal/logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src={`${import.meta.env.BASE_URL}images/dm-avatar.png`} alt="DM Seal" className="w-1/2 h-auto grayscale blur-[2px]" />
      </div>

      <div className="max-w-3xl mx-auto space-y-12 pb-24 relative z-10">
        {turns.map((turn, index) => (
          <motion.div 
            key={turn.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Turn Divider */}
            <div className="flex items-center justify-center space-x-4 opacity-30 my-8">
              <div className="h-px bg-primary flex-1" />
              <span className="font-display text-xs tracking-[0.2em] text-primary uppercase">Turn {turn.turnNumber}</span>
              <div className="h-px bg-primary flex-1" />
            </div>

            {/* Player Action */}
            {turn.playerAction && (
              <div className="flex justify-end">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 max-w-[85%] shadow-lg shadow-accent/5 backdrop-blur-sm">
                  <div className="flex items-center text-accent/80 mb-2 space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">Player Action</span>
                  </div>
                  <p className="font-mono text-accent/90 text-sm whitespace-pre-wrap leading-relaxed">
                    {turn.playerAction}
                  </p>
                </div>
              </div>
            )}

            {/* DM Narrative */}
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[95%]">
                <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <div className="w-10 h-10 rounded-full border border-primary/30 overflow-hidden shadow-[0_0_15px_rgba(200,160,100,0.15)]">
                    <img src={`${import.meta.env.BASE_URL}images/dm-avatar.png`} alt="DM" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="prose prose-invert prose-p:font-serif prose-p:text-lg prose-p:leading-loose prose-p:text-foreground/90 prose-strong:text-primary prose-a:text-accent max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: turn.narrative.replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            </div>
            
            {/* Display extracted updates if any exist - simple visual log */}
            {turn.worldUpdates && Object.keys(turn.worldUpdates).length > 0 && (
              <div className="flex justify-center pt-2">
                <div className="bg-black/40 border border-white/5 rounded px-4 py-2 text-xs font-mono text-muted-foreground flex items-center">
                  <PenTool className="w-3 h-3 mr-2 opacity-50" />
                  World State Updated
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Thinking Indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center space-x-4 max-w-[95%]"
            >
               <div className="flex-shrink-0 mt-1 hidden sm:block">
                  <div className="w-10 h-10 rounded-full border border-primary/50 overflow-hidden shadow-[0_0_20px_rgba(200,160,100,0.4)] animate-pulse">
                    <img src={`${import.meta.env.BASE_URL}images/dm-avatar.png`} alt="DM" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="bg-black/30 border border-primary/20 rounded-lg p-4 backdrop-blur-sm flex items-center space-x-3 text-primary/80 font-serif italic text-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  <span>The Game Master is weaving the tapestry...</span>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
