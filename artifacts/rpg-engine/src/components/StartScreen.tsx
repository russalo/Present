import React, { useState } from "react";
import { useStartNewSession } from "@workspace/api-client-react";
import { Button } from "./ui/RpgButton";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";

export function StartScreen({ onStarted }: { onStarted: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    worldName: "",
    playerCharacterName: "",
    playerCharacterClass: "",
    worldSeed: ""
  });

  const { mutate: startSession, isPending } = useStartNewSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/session"] });
        queryClient.invalidateQueries({ queryKey: ["/api/world"] });
        onStarted();
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startSession({ data: formData });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Texture & Vignette */}
      <div 
        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-texture.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
      />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl mx-auto p-8 rounded-xl border border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl shadow-black/50"
      >
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 mx-auto text-primary mb-4 opacity-80" />
          <h1 className="text-4xl font-display text-primary drop-shadow-[0_0_10px_rgba(200,160,100,0.3)] mb-2">
            The World Engine
          </h1>
          <p className="text-muted-foreground font-serif text-lg italic">
            "A new thread of fate awaits its weaver."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-serif text-lg">
          <div>
            <label className="block text-primary/80 mb-1 font-display tracking-widest text-sm uppercase">World Name</label>
            <input 
              type="text"
              placeholder="e.g. Eldoria, The Wastes..."
              className="w-full bg-black/40 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              value={formData.worldName}
              onChange={e => setFormData({...formData, worldName: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-primary/80 mb-1 font-display tracking-widest text-sm uppercase">Character Name</label>
              <input 
                type="text"
                placeholder="e.g. Kaelen"
                className="w-full bg-black/40 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={formData.playerCharacterName}
                onChange={e => setFormData({...formData, playerCharacterName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-primary/80 mb-1 font-display tracking-widest text-sm uppercase">Class/Role</label>
              <input 
                type="text"
                placeholder="e.g. Rogue, Scholar"
                className="w-full bg-black/40 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={formData.playerCharacterClass}
                onChange={e => setFormData({...formData, playerCharacterClass: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-primary/80 mb-1 font-display tracking-widest text-sm uppercase">World Seed (Optional)</label>
            <textarea 
              rows={3}
              placeholder="Describe the setting, tone, or starting scenario..."
              className="w-full bg-black/40 border border-border rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              value={formData.worldSeed}
              onChange={e => setFormData({...formData, worldSeed: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full relative group overflow-hidden"
              isLoading={isPending}
            >
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {isPending ? "Weaving Reality..." : "Begin Journey"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
