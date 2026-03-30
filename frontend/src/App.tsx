import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import {
  Player,
  PlayerFilterOptions,
  Pitch,
  PitchFilterOptions,
} from "./types";

import PlayerFilterControls from "./components/PlayerFilterControls";
import PlayerTable from "./components/PlayerTable";
import PitchFilterControls from "./components/PitchFilterControls";
import PitchTable from "./components/PitchTable";

import ApiService from "./services/api";

const App: React.FC = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);

  const [playersLoading, setPlayersLoading] = useState(false);
  const [pitchesLoading, setPitchesLoading] = useState(false);
  
  const [playersError, setPlayersError] = useState<string>("");
  const [pitchesError, setPitchesError] = useState<string>("");

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
    setPlayersLoading(true);
    setPlayersError("");

    try {
      const data = await ApiService.getPlayers(filters);
      setPlayers(data);

    } 
    catch (e) {
      setPlayersError(
        e instanceof Error ? e.message : "Failed to load players"
      );

      setPlayers([]);
    } 
    finally {
      setPlayersLoading(false);
    }
    
  }, []);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      setPlayersLoading(true);
      setPlayersError("");

      try {
        const data = await ApiService.getPlayers();

        if (!cancelled) {
          setAllPlayers(data);
          setPlayers(data);
        }
      
      } 
      catch (e) {
        if (!cancelled) {
          setPlayersError(
            e instanceof Error ? e.message : "Failed to load players"
          );
        }

      } 
      finally {
        if (!cancelled) setPlayersLoading(false);
      }

    })();

    return () => {
      cancelled = true;
    };

  }, []);

  const handlePlayerFilterChange = (filters: PlayerFilterOptions) => {
    void loadPlayers(filters);
  };

  const handlePitchSearch = async (filters: PitchFilterOptions) => {
    setPitchesLoading(true);
    setPitchesError("");

    try {
      const data = await ApiService.getPitches(filters);
      setPitches(data);
    } 
    catch (e) {
      setPitchesError(e instanceof Error ? e.message : "Failed to load pitches");
      setPitches([]);
    } 
    finally {
      setPitchesLoading(false);
    }
    
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
            onFilterChange={handlePlayerFilterChange}
            availableTeams={availableTeams}
            availablePositions={availablePositions}
          />
        </section>

        <section className="data-section">
          <PlayerTable
            players={players}
            isLoading={playersLoading}
            error={playersError}
          />
        </section>

        <section className="filter-section">
          <PitchFilterControls onSearch={handlePitchSearch} />
        </section>

        <section className="data-section">
          <PitchTable
            pitches={pitches}
            isLoading={pitchesLoading}
            error={pitchesError}
          />
        </section>
      </main>

      <footer>
        <p>Houston Astros - Staff Software Engineer Assessment</p>
      </footer>
    </div>
  );
};

export default App;
