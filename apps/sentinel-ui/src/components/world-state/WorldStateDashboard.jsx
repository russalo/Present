import { useWorldStore } from '../../stores/worldStore';
import { LocationList } from './LocationList';
import { CharacterList } from './CharacterList';
import { FactionList } from './FactionList';
import { WorldMetrics } from './WorldMetrics';

export function WorldStateDashboard() {
  const { locations, characters, factions, day, tension } = useWorldStore();

  return (
    <div className="p-4 space-y-4">
      <LocationList locations={locations} />
      <CharacterList characters={characters} />
      <FactionList factions={factions} />
      <WorldMetrics day={day} tension={tension} />
    </div>
  );
}
