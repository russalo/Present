import React, { useState } from "react";
import { useGetWorldState, useListCharacters, useListLocations, useListFactions, useListItems, Character, Location, Faction, Item } from "@workspace/api-client-react";
import { TensionMeter, RelationBar } from "./Meters";
import { Badge } from "./ui/RpgBadge";
import { Clock, Map, Cloud, Activity, Users, Shield, MapPin, Package, Heart, Skull, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function WorldSidebar() {
  const { data: world } = useGetWorldState({ query: { refetchInterval: 5000 } });
  const [activeTab, setActiveTab] = useState<"characters" | "locations" | "factions" | "items">("characters");

  if (!world) return <div className="w-80 border-r border-border/50 bg-card/80 p-4 animate-pulse-slow">Loading world...</div>;

  return (
    <div className="w-[380px] h-full border-r border-border/60 bg-[#0a0a0c]/90 backdrop-blur-md flex flex-col shadow-2xl z-20">
      {/* World Header */}
      <div className="p-5 border-b border-border/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <h2 className="text-2xl font-display text-primary mb-1 drop-shadow-[0_0_8px_rgba(200,160,100,0.3)]">{world.worldName}</h2>
        <div className="text-sm font-serif text-muted-foreground mb-4 opacity-80">{world.currentEra}</div>
        
        <div className="grid grid-cols-2 gap-3 text-sm font-sans mb-4">
          <div className="flex items-center text-secondary-foreground bg-black/30 p-2 rounded-md border border-white/5">
            <MapPin className="w-4 h-4 mr-2 text-primary/70" />
            <span className="truncate" title={world.currentLocation}>{world.currentLocation}</span>
          </div>
          <div className="flex items-center text-secondary-foreground bg-black/30 p-2 rounded-md border border-white/5">
            <Clock className="w-4 h-4 mr-2 text-primary/70" />
            <span className="truncate">{world.timeOfDay}</span>
          </div>
          <div className="flex items-center text-secondary-foreground bg-black/30 p-2 rounded-md border border-white/5 col-span-2">
            <Cloud className="w-4 h-4 mr-2 text-primary/70" />
            <span className="truncate">{world.weather}</span>
          </div>
        </div>

        <TensionMeter tension={world.tension} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 bg-black/20">
        {[
          { id: "characters", icon: Users, count: world.characterCount },
          { id: "locations", icon: Map, count: world.locationCount },
          { id: "factions", icon: Shield, count: world.factionCount },
          { id: "items", icon: Package, count: world.itemCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-3 flex flex-col items-center justify-center transition-all border-b-2 relative",
              activeTab === tab.id 
                ? "text-primary border-primary bg-primary/5" 
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-display uppercase tracking-widest">{tab.id}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "characters" && <CharactersList />}
            {activeTab === "locations" && <LocationsList />}
            {activeTab === "factions" && <FactionsList />}
            {activeTab === "items" && <ItemsList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CharactersList() {
  const { data: characters } = useListCharacters({ query: { refetchInterval: 5000 } });
  
  if (!characters) return <div className="text-center p-4 text-muted-foreground font-mono text-sm">Scanning roster...</div>;
  if (characters.length === 0) return <div className="text-center p-4 text-muted-foreground italic">No souls found.</div>;

  return (
    <div className="space-y-3">
      {characters.map((c: Character) => (
        <div key={c.id} className="bg-black/40 border border-white/5 p-3 rounded-lg hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</h4>
              <p className="text-xs font-sans text-muted-foreground">{c.race} {c.class}</p>
            </div>
            <Badge variant={
              c.status === "alive" ? "success" : 
              c.status === "dead" ? "danger" : "outline"
            }>
              {c.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-xs font-mono mt-3 text-muted-foreground bg-black/50 p-1.5 rounded">
            <div className="flex items-center">
              <Heart className="w-3 h-3 text-red-400 mr-1" />
              {c.health ?? '?'}/{c.maxHealth ?? '?'}
            </div>
            <div>LVL {c.level ?? '?'}</div>
            <Badge variant="terminal" className="text-[9px]">{c.role}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationsList() {
  const { data: locations } = useListLocations({ query: { refetchInterval: 5000 } });
  
  if (!locations) return <div className="text-center p-4 text-muted-foreground font-mono text-sm">Mapping realms...</div>;

  return (
    <div className="space-y-3">
      {locations.map((l: Location) => (
        <div key={l.id} className={cn("bg-black/40 border border-white/5 p-3 rounded-lg transition-colors", l.discovered ? "hover:border-primary/30" : "opacity-60 grayscale")}>
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-display font-bold text-foreground">{l.name}</h4>
            {l.danger !== undefined && (
              <Badge variant={l.danger > 7 ? "danger" : l.danger > 3 ? "warning" : "success"}>
                <Skull className="w-3 h-3 mr-1 inline" /> Danger {l.danger}
              </Badge>
            )}
          </div>
          <p className="text-xs font-sans text-muted-foreground mb-2">{l.type} {l.region ? `• ${l.region}` : ''}</p>
          {!l.discovered && <Badge variant="outline" className="text-[10px]">Undiscovered</Badge>}
        </div>
      ))}
    </div>
  );
}

function FactionsList() {
  const { data: factions } = useListFactions({ query: { refetchInterval: 5000 } });
  
  if (!factions) return <div className="text-center p-4 text-muted-foreground font-mono text-sm">Gathering intel...</div>;

  return (
    <div className="space-y-3">
      {factions.map((f: Faction) => (
        <div key={f.id} className="bg-black/40 border border-white/5 p-3 rounded-lg hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-display font-bold text-foreground">{f.name}</h4>
            <span className="text-xs font-sans text-muted-foreground">{f.alignment}</span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
              <span>Relation ({f.playerRelation})</span>
            </div>
            <RelationBar relation={f.playerRelation ?? 0} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemsList() {
  const { data: items } = useListItems({ query: { refetchInterval: 5000 } });
  
  if (!items) return <div className="text-center p-4 text-muted-foreground font-mono text-sm">Searching inventory...</div>;

  return (
    <div className="space-y-3">
      {items.map((i: Item) => (
        <div key={i.id} className="bg-black/40 border border-white/5 p-3 rounded-lg hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-1">
            <h4 className={cn("font-display font-bold", 
              i.rarity === 'legendary' || i.rarity === 'artifact' ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]' : 
              i.rarity === 'rare' ? 'text-blue-400' : 'text-foreground'
            )}>
              {i.name}
            </h4>
            <Badge variant="outline" className="text-[10px] capitalize">{i.type}</Badge>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-xs font-sans text-muted-foreground capitalize">{i.rarity}</span>
            {i.magical && <Badge variant="terminal" className="text-[10px]"><Sparkles className="w-3 h-3 mr-1 inline"/> Magical</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}
