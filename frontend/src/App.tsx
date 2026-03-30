import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import { Player, PlayerFilterOptions } from "./types";
import PlayerFilterControls from "./components/PlayerFilterControls";
import PlayerTable from "./components/PlayerTable";
import ApiService from "./services/api";

const App: React.FC = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const availableTeams = useMemo(() => {
    const s = new Set<string>();
    for (const p of allPlayers) s.add(p.team);

    return Array.from(s).sort();

  }, [allPlayers]);

  const availablePositions = useMemo(() => {
    const s = new Set<string>();
    for (const p of allPlayers) s.add(p.primary_position);

    return Array.from(s).sort();

  }, [allPlayers]);

  const loadPlayers = useCallback(async (filters: PlayerFilterOptions) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await ApiService.getPlayers(filters);
      setPlayers(data);

    } 
    catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load players");
      setPlayers([]);

    } 
    finally {
      setIsLoading(false);

    }

  }, []);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await ApiService.getPlayers();

        if (!cancelled) {
          setAllPlayers(data);
          setPlayers(data);
        }
      } 
      catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load players");
        }
      } 
      finally {
        if (!cancelled) setIsLoading(false);
      }

    })();

    return () => {
      cancelled = true;
    };

  }, []);

  const handleFilterChange = (filters: PlayerFilterOptions) => {
    void loadPlayers(filters);
  };

  return (
    <div className="App">
      <header>
        <h1>Baseball Player Statistics</h1>
        <p>Explore player statistics</p>
      </header>

      <main>
        <section className="filter-section">
          <PlayerFilterControls
            onFilterChange={handleFilterChange}
            availableTeams={availableTeams}
            availablePositions={availablePositions}
          />
        </section>

        <section className="data-section">
          <PlayerTable
            players={players}
            isLoading={isLoading}
            error={error}
          />
        </section>

        {/* TODO: Pitch Filter Controls}
        {/* TODO: Implement pitches table */}
      </main>

      <footer>
        <p>Houston Astros - Staff Software Engineer Assessment</p>
      </footer>
    </div>
  );
};

export default App;
