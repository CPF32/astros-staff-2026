import React, { useEffect, useMemo, useState, FormEvent } from "react";
import { PitchFilterOptions, Player } from "../types";
import AutocompleteInput from "./AutocompleteInput";

interface PitchFilterControlsProps {
  onSearch: (filters: PitchFilterOptions) => void;
  players?: Player[];
  selectedPlayer?: Player | null;
}

const PitchFilterControls: React.FC<PitchFilterControlsProps> = ({
  onSearch,
  players = [],
  selectedPlayer = null,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [pitchType, setPitchType] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [minSpeed, setMinSpeed] = useState("");
  const [maxSpeed, setMaxSpeed] = useState("");
  const [minReleasePosX, setMinReleasePosX] = useState("");
  const [maxReleasePosX, setMaxReleasePosX] = useState("");
  const [minReleasePosZ, setMinReleasePosZ] = useState("");
  const [maxReleasePosZ, setMaxReleasePosZ] = useState("");
  const [minSpinRate, setMinSpinRate] = useState("");
  const [maxSpinRate, setMaxSpinRate] = useState("");
  const [validationError, setValidationError] = useState("");

  const parseOptionalFloat = (raw: string): number | undefined => {
    const t = raw.trim();

    if (!t) return undefined;

    const n = Number.parseFloat(t);
    return Number.isFinite(n) ? n : undefined;
  };

  const playerNameOptions = useMemo(() => {
    const out: string[] = [];

    for (const p of players) {
      out.push(`${p.first_name} ${p.last_name}`.trim());
      out.push(`${p.last_name}, ${p.first_name}`.trim());
    }

    return Array.from(new Set(out.filter(Boolean))).sort();
  }, [players]);

  // probably ok to hardcode, only so many pitch types...
  const pitchTypeOptions = useMemo(
    () => [
      "",
      "FF",
      "SI",
      "FT",
      "FC",
      "FS",
      "SL",
      "CU",
      "KC",
      "CH",
      "EP",
      "KN",
      "ST",
      "SV",
    ],
    []
  );

  const findPlayerIdByName = (raw: string): number | undefined => {
    const needle = raw.trim().toLowerCase();
    if (!needle) return undefined;

    for (const p of players) {
      const a = `${p.first_name} ${p.last_name}`.trim().toLowerCase();
      const b = `${p.last_name}, ${p.first_name}`.trim().toLowerCase();

      if (needle === a || needle === b) return p.player_id;
    }

    for (const p of players) {
      const a = `${p.first_name} ${p.last_name}`.trim().toLowerCase();
      const b = `${p.last_name}, ${p.first_name}`.trim().toLowerCase();

      if (a.includes(needle) || b.includes(needle)) return p.player_id;
    }

    return undefined;
  };

  useEffect(() => {
    if (!selectedPlayer) return;

    const fullName = `${selectedPlayer.first_name} ${selectedPlayer.last_name}`.trim();

    setPlayerName(fullName);
    setAdvancedOpen(false);

  }, [selectedPlayer]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const selectedId = playerName.trim() ? findPlayerIdByName(playerName) : undefined;
    const hasBadPlayer = playerName.trim().length > 0 && selectedId === undefined;

    const minS = parseOptionalFloat(minSpeed);
    const maxS = parseOptionalFloat(maxSpeed);
    const hasBadMinSpeed = minSpeed.trim().length > 0 && minS === undefined;
    const hasBadMaxSpeed = maxSpeed.trim().length > 0 && maxS === undefined;
    const hasBadMinReleaseX = minReleasePosX.trim().length > 0 && parseOptionalFloat(minReleasePosX) === undefined;
    const hasBadMaxReleaseX = maxReleasePosX.trim().length > 0 && parseOptionalFloat(maxReleasePosX) === undefined;
    const hasBadMinReleaseZ = minReleasePosZ.trim().length > 0 && parseOptionalFloat(minReleasePosZ) === undefined;
    const hasBadMaxReleaseZ = maxReleasePosZ.trim().length > 0 && parseOptionalFloat(maxReleasePosZ) === undefined;
    const hasBadMinSpinRate = minSpinRate.trim().length > 0 && parseOptionalFloat(minSpinRate) === undefined;
    const hasBadMaxSpinRate = maxSpinRate.trim().length > 0 && parseOptionalFloat(maxSpinRate) === undefined;

    if (
      hasBadPlayer ||
      hasBadMinSpeed ||
      hasBadMaxSpeed ||
      hasBadMinReleaseX ||
      hasBadMaxReleaseX ||
      hasBadMinReleaseZ ||
      hasBadMaxReleaseZ ||
      hasBadMinSpinRate ||
      hasBadMaxSpinRate
    ) {
      setValidationError("Fix invalid inputs (use player names, numbers for metrics).");
      return;
    }

    setValidationError("");
    const filters: PitchFilterOptions = {};

    if (selectedId !== undefined) {
      const p = players.find((pl) => pl.player_id === selectedId);
      const pos = (p?.primary_position || "").trim().toUpperCase();
      const isPitcherHandedness = ["LHR", "RHR", "LHS", "RHS"].includes(pos);

      if (isPitcherHandedness) filters.pitcher = selectedId;
      else filters.batter = selectedId;
    }

    if (gameDate.trim()) filters.game_date = gameDate.trim();
    if (pitchType.trim()) filters.pitch_type = pitchType.trim();

    if (minS !== undefined) filters.min_speed = minS;
    if (maxS !== undefined) filters.max_speed = maxS;
    
    const minRx = parseOptionalFloat(minReleasePosX);
    const maxRx = parseOptionalFloat(maxReleasePosX);
    const minRz = parseOptionalFloat(minReleasePosZ);
    const maxRz = parseOptionalFloat(maxReleasePosZ);
    const minSr = parseOptionalFloat(minSpinRate);
    const maxSr = parseOptionalFloat(maxSpinRate);

    if (minRx !== undefined) filters.min_release_pos_x = minRx;
    if (maxRx !== undefined) filters.max_release_pos_x = maxRx;
    if (minRz !== undefined) filters.min_release_pos_z = minRz;
    if (maxRz !== undefined) filters.max_release_pos_z = maxRz;
    if (minSr !== undefined) filters.min_spin_rate = minSr;
    if (maxSr !== undefined) filters.max_spin_rate = maxSr;

    onSearch(filters);
  };

  const handleClear = () => {
    setPlayerName("");
    setGameDate("");
    setPitchType("");
    setMinSpeed("");
    setMaxSpeed("");
    setMinReleasePosX("");
    setMaxReleasePosX("");
    setMinReleasePosZ("");
    setMaxReleasePosZ("");
    setMinSpinRate("");
    setMaxSpinRate("");
    setValidationError("");
    onSearch({});
  };

  return (
    <div className="filter-controls">
      <h3>Pitches</h3>
      <form className="filter-row filter-row-single-line" onSubmit={handleSubmit}>
        <div className="filter-group filter-group-grow">
          <AutocompleteInput
            id="player-name-pitch"
            label="Player"
            value={playerName}
            onChange={setPlayerName}
            options={playerNameOptions}
            placeholder="Search by name"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="game-date">Date</label>
          <input
            id="game-date"
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setAdvancedOpen(true)}
          aria-label="Advanced pitch filters"
          title="More filters"
        >
          ⋯
        </button>
        <button type="submit" className="btn btn-icon" aria-label="Search" title="Search">
          ⌕
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={handleClear}
          aria-label="Reset"
          title="Reset"
        >
          ⟲
        </button>
      </form>
      <dialog open={advancedOpen} className="advanced-dialog" aria-label="Advanced pitch filters">
        <div className="advanced-dialog-head">
          <strong>Advanced Pitch Filters</strong>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => setAdvancedOpen(false)}
            aria-label="Close advanced filters"
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="advanced-grid">
          <div className="filter-group">
            <label htmlFor="adv-pitch-type">Pitch type</label>
            <select
              id="adv-pitch-type"
              value={pitchType}
              onChange={(e) => setPitchType(e.target.value)}
            >
              {pitchTypeOptions.map((pt) => (
                <option key={pt || "__all"} value={pt}>
                  {pt || "All"}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="adv-min-speed">Min mph</label>
            <input id="adv-min-speed" value={minSpeed} onChange={(e) => setMinSpeed(e.target.value)} />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-max-speed">Max mph</label>
            <input id="adv-max-speed" value={maxSpeed} onChange={(e) => setMaxSpeed(e.target.value)} />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-min-release-x">Min rel X</label>
            <input
              id="adv-min-release-x"
              value={minReleasePosX}
              onChange={(e) => setMinReleasePosX(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-max-release-x">Max rel X</label>
            <input
              id="adv-max-release-x"
              value={maxReleasePosX}
              onChange={(e) => setMaxReleasePosX(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-min-release-z">Min rel Z</label>
            <input
              id="adv-min-release-z"
              value={minReleasePosZ}
              onChange={(e) => setMinReleasePosZ(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-max-release-z">Max rel Z</label>
            <input
              id="adv-max-release-z"
              value={maxReleasePosZ}
              onChange={(e) => setMaxReleasePosZ(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-min-spin-rate">Min spin rate</label>
            <input
              id="adv-min-spin-rate"
              value={minSpinRate}
              onChange={(e) => setMinSpinRate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="adv-max-spin-rate">Max spin rate</label>
            <input
              id="adv-max-spin-rate"
              value={maxSpinRate}
              onChange={(e) => setMaxSpinRate(e.target.value)}
            />
          </div>
        </div>
      </dialog>
      {validationError && <div className="inline-error">{validationError}</div>}
    </div>
  );
};

export default PitchFilterControls;
