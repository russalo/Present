import React, { useState } from "react";
import { useGetSessionLog, useProcessTurn } from "@workspace/api-client-react";
import { StartScreen } from "@/components/StartScreen";
import { WorldSidebar } from "@/components/WorldSidebar";
import { NarrativePanel } from "@/components/NarrativePanel";
import { Button } from "@/components/ui/RpgButton";
import { Terminal, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function GameConsole() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  
  // Try to get session log. Retry false so we can immediately fallback to StartScreen if none exists.
  const { data: sessionLog, isLoading: sessionLoading, isError } = useGetSessionLog({ 
    query: { 
      refetchInterval: 5000,
      retry: false 
    } 
  });

  const { mutate: takeTurn, isPending: isTakingTurn } = useProcessTurn({
    mutation: {
      onSuccess: () => {
        setInput("");
        // Invalidate to fetch fresh updates
        queryClient.invalidateQueries({ queryKey: ["/api/session"] });
        queryClient.invalidateQueries({ queryKey: ["/api/world"] });
        queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
        queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/factions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      }
    }
  });

  if (sessionLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-primary font-display animate-pulse-slow text-2xl tracking-widest">Loading Reality...</div>;
  }

  // If no session exists or error fetching, show the Start screen
  if (isError || !sessionLog || !sessionLog.sessionId) {
    return <StartScreen onStarted={() => queryClient.invalidateQueries({ queryKey: ["/api/session"] })} />;
  }

  const handleSubmit = () => {
    if (!input.trim() || isTakingTurn) return;
    takeTurn({ data: { action: input.trim(), sessionId: sessionLog.sessionId } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground relative">
      {/* Global Background Texture */}
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-screen pointer-events-none" 
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-texture.png)`, backgroundSize: 'cover' }} 
      />

      {/* Sidebar */}
      <WorldSidebar />

      {/* Main Console Area */}
      <main className="flex-1 flex flex-col relative z-10 bg-black/60 shadow-[-20px_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Chat / Narrative Log */}
        <NarrativePanel turns={sessionLog.turns} isThinking={isTakingTurn} />

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex bg-[#0c0c0e] border border-border focus-within:border-accent/50 rounded-xl overflow-hidden shadow-2xl transition-colors">
              <div className="p-4 flex items-start text-muted-foreground/50 border-r border-border/50 bg-black/20">
                <Terminal className="w-5 h-5" />
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you do next? (Shift+Enter for newline)"
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-4 text-accent font-mono text-sm leading-relaxed placeholder:text-muted-foreground/40 placeholder:font-serif placeholder:italic"
                rows={3}
                disabled={isTakingTurn}
              />
              <div className="p-3 flex items-end justify-center bg-black/20 border-l border-border/50">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!input.trim() || isTakingTurn}
                  size="sm"
                  className="h-10 w-10 p-0 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
