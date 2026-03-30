import React, { useState, FormEvent } from "react";
import { PitchFilterOptions } from "../types";

interface PitchFilterControlsProps {
  onSearch: (filters: PitchFilterOptions) => void;
}

const PitchFilterControls: React.FC<PitchFilterControlsProps> = ({
  onSearch,
}) => {
  const [pitcher, setPitcher] = useState("");
  const [batter, setBatter] = useState("");
  const [minSpeed, setMinSpeed] = useState("");

  const parseOptionalInt = (raw: string): number | undefined => {
    const t = raw.trim();
    if (!t) return undefined;

    const n = Number.parseInt(t, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  const parseOptionalFloat = (raw: string): number | undefined => {
    const t = raw.trim();
    if (!t) return undefined;

    const n = Number.parseFloat(t);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const filters: PitchFilterOptions = {};
    const p = parseOptionalInt(pitcher);
    const b = parseOptionalInt(batter);
    const m = parseOptionalFloat(minSpeed);

    if (p !== undefined) filters.pitcher = p;
    if (b !== undefined) filters.batter = b;
    if (m !== undefined) filters.min_speed = m;

    onSearch(filters);
  };

  const handleClear = () => {
    setPitcher("");
    setBatter("");
    setMinSpeed("");
    onSearch({});
  };

  return (
    <div className="filter-controls">
      <h3>Filter Pitches</h3>
      <form className="filter-row" onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="pitcher-id">Pitcher player id</label>
          <input
            id="pitcher-id"
            type="text"
            inputMode="numeric"
            value={pitcher}
            onChange={(ev) => setPitcher(ev.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="batter-id">Batter player id</label>
          <input
            id="batter-id"
            type="text"
            inputMode="numeric"
            value={batter}
            onChange={(ev) => setBatter(ev.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="min-speed">Min speed (mph)</label>
          <input
            id="min-speed"
            type="text"
            inputMode="decimal"
            value={minSpeed}
            onChange={(ev) => setMinSpeed(ev.target.value)}
          />
        </div>
        <button type="submit" className="clear-filters">
          Search
        </button>
        <button type="button" className="clear-filters" onClick={handleClear}>
          Clear
        </button>
      </form>
    </div>
  );
};

export default PitchFilterControls;
