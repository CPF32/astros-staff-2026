import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import {
  ApiMetrics,
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
  const [playersRaw, setPlayersRaw] = useState<Player[]>([]);
  const [pitchesRaw, setPitchesRaw] = useState<Pitch[]>([]);
  const [playerFilters, setPlayerFilters] = useState<PlayerFilterOptions>({});
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [lastPitchFilters, setLastPitchFilters] = useState<PitchFilterOptions>({});
  const [playersLoading, setPlayersLoading] = useState(false);
  const [pitchesLoading, setPitchesLoading] = useState(false);
  const [playersError, setPlayersError] = useState("");
  const [pitchesError, setPitchesError] = useState("");
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null);

  const playerNameById = useMemo(() => {
    const map = new Map<number, string>();

    for (const p of playersRaw) {
      map.set(p.player_id, `${p.first_name} ${p.last_name}`.trim());
    }

    return map;

  }, [playersRaw]);

  const availableTeams = useMemo(
    () => Array.from(new Set(playersRaw.map((p) => p.team))).sort(),
    [playersRaw]

  );

  const availablePositions = useMemo(
    () => Array.from(new Set(playersRaw.map((p) => p.primary_position))).sort(),
    [playersRaw]
    
  );

  const players = useMemo(() => {
    return playersRaw.filter((p) => {
      const nameNeedle = (playerFilters.name || "").trim().toLowerCase();
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();

      if (nameNeedle && !fullName.includes(nameNeedle)) return false;
      if (playerFilters.throws && p.throws !== playerFilters.throws) return false;
      if (playerFilters.bats && p.bats !== playerFilters.bats) return false;

      return true;
    });

  }, [playersRaw, playerFilters]);

  const refreshMetrics = useCallback(async () => {
    try {
      const data = await ApiService.getMetrics();
      setMetrics(data);

    } 
    catch {
      setMetrics(null);
    }

  }, []);

  const loadPlayers = useCallback(async (filters: PlayerFilterOptions) => {
    setPlayersLoading(true);
    setPlayersError("");

    try {
      const data = await ApiService.getPlayers(filters);
      setPlayersRaw(data);

    } 
    catch (e) {
      setPlayersError(e instanceof Error ? e.message : "Failed to load players");
      setPlayersRaw([]);

    } 
    finally {
      setPlayersLoading(false);
      void refreshMetrics();
    }

  }, [refreshMetrics]);

  useEffect(() => {
    void loadPlayers({});
  }, [loadPlayers]);

  const handlePlayerFilterChange = (filters: PlayerFilterOptions) => {
    setPlayerFilters(filters);
    void loadPlayers(filters);
  };

  const handlePitchSearch = async (filters: PitchFilterOptions) => {
    setLastPitchFilters(filters);
    setPitchesLoading(true);
    setPitchesError("");

    try {
      const data = await ApiService.getPitches(filters);
      setPitchesRaw(data);

    } 
    catch (e) {
      setPitchesError(e instanceof Error ? e.message : "Failed to load pitches");
      setPitchesRaw([]);

    } 
    finally {
      setPitchesLoading(false);
      void refreshMetrics();

    }
  };

  const handleSelectPlayer = useCallback(
    (player: Player) => {
      setSelectedPlayer(player);

      const pos = (player.primary_position || "").trim().toUpperCase();
      const isPitcherHandedness = ["LHR", "RHR", "LHS", "RHS"].includes(pos);
      const { pitcher: _oldPitcher, batter: _oldBatter, ...restFilters } = lastPitchFilters;

      const next: PitchFilterOptions = {
        ...restFilters,
        ...(isPitcherHandedness ? { pitcher: player.player_id } : { batter: player.player_id }),
      };
      
      void handlePitchSearch(next);
    },
    [lastPitchFilters]
  );

  return (
    <div className="App">
      <header>
        <h1>Houston Astros Data Lens</h1>
        <div className="status-bar">
          <div className="status-left">
            <span>Players: {players.length}</span>
            <span>Pitches: {pitchesRaw.length}</span>
          </div>
          <div className="status-right">
            <span>Requests: {metrics?.requests_total ?? 0}</span>
            <span>Last API ms: {metrics?.last_request_ms ?? 0}</span>
          </div>
        </div>
      </header>

      <main className="panel-grid">
        <section className="panel">
          <PlayerFilterControls
            onFilterChange={handlePlayerFilterChange}
            availableTeams={availableTeams}
            availablePositions={availablePositions}
            players={playersRaw}
          />
          <PlayerTable
            players={players}
            selectedPlayerId={selectedPlayer?.player_id ?? null}
            onSelectPlayer={handleSelectPlayer}
            isLoading={playersLoading}
            error={playersError}
          />
        </section>

        <section className="panel">
          <PitchFilterControls
            onSearch={handlePitchSearch}
            players={playersRaw}
            selectedPlayer={selectedPlayer}
          />
          <PitchTable
            pitches={pitchesRaw}
            isLoading={pitchesLoading}
            error={pitchesError}
            playerNameById={playerNameById}
          />
        </section>
      </main>

      <footer>
        <p>Astros R&D Staff SWE Assessment</p>
      </footer>
    </div>
  );
};

export default App;
