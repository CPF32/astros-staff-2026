import React, { useMemo, useState, ChangeEvent } from "react";
import { Player, PlayerFilterOptions } from "../types";
import AutocompleteInput from "./AutocompleteInput";

interface PlayerFilterControlsProps {
  onFilterChange: (filters: PlayerFilterOptions) => void;
  availableTeams?: string[];
  availablePositions?: string[];
  players?: Player[];
}

const PlayerFilterControls: React.FC<PlayerFilterControlsProps> = ({
  onFilterChange,
  availableTeams = [],
  availablePositions = [],
  players = [],
}) => {
  const [filters, setFilters] = useState<PlayerFilterOptions>({});

  const throwOptions = useMemo(() => ["R", "L"], []);
  const batOptions = useMemo(() => ["R", "L", "S"], []);
  const playerNameOptions = useMemo(() => {
    const out: string[] = [];

    for (const p of players) {
      out.push(`${p.first_name} ${p.last_name}`.trim());
      out.push(`${p.last_name}, ${p.first_name}`.trim());
    }

    return Array.from(new Set(out.filter(Boolean))).sort();

  }, [players]);

  const emit = (next: PlayerFilterOptions) => {
    setFilters(next);
    onFilterChange(next);
  };

  const handleTeamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const team = event.target.value || undefined;
    emit({ ...filters, team });
  };

  const handlePositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const position = event.target.value || undefined;
    emit({ ...filters, position });
  };

  const handleThrowsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const throws = event.target.value || undefined;
    emit({ ...filters, throws });
  };

  const handleBatsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const bats = event.target.value || undefined;
    emit({ ...filters, bats });
  };

  const clearFilters = () => {
    emit({});
  };

  return (
    <div className="filter-controls">
      <h3>Players</h3>
      <div className="filter-row filter-row-single-line">
        <div className="filter-group filter-group-grow">
          <AutocompleteInput
            id="player-name"
            label="Name"
            value={filters.name || ""}
            onChange={(next) => emit({ ...filters, name: next || undefined })}
            options={playerNameOptions}
            placeholder="Search player"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="team-filter">Team</label>
          <select id="team-filter" value={filters.team || ""} onChange={handleTeamChange}>
            <option value="">All</option>
            {availableTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="position-filter">Position</label>
          <select
            id="position-filter"
            value={filters.position || ""}
            onChange={handlePositionChange}
          >
            <option value="">All</option>
            {availablePositions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="throws-filter">Throws</label>
          <select id="throws-filter" value={filters.throws || ""} onChange={handleThrowsChange}>
            <option value="">All</option>
            {throwOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="bats-filter">Bats</label>
          <select id="bats-filter" value={filters.bats || ""} onChange={handleBatsChange}>
            <option value="">All</option>
            {batOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-icon"
          onClick={clearFilters}
          aria-label="Reset filters"
          title="Reset filters"
        >
          ⟲
        </button>
      </div>
    </div>
  );
};

export default PlayerFilterControls;
