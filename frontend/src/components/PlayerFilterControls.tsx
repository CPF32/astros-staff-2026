import React, { useState, ChangeEvent } from "react";
import { PlayerFilterOptions } from "../types";

interface PlayerFilterControlsProps {
  onFilterChange: (filters: PlayerFilterOptions) => void;
  availableTeams?: string[];
  availablePositions?: string[];
}

const PlayerFilterControls: React.FC<PlayerFilterControlsProps> = ({
  onFilterChange: _onFilterChange,
  availableTeams: _availableTeams = [],
  availablePositions: _availablePositions = [],
}) => {
  const [filters, _setFilters] = useState<PlayerFilterOptions>({});

  const emit = (next: PlayerFilterOptions) => {
    _setFilters(next);
    _onFilterChange(next);

  };

  const handleTeamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const team = event.target.value || undefined;
    emit({ ...filters, team });

  };

  const handlePositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const position = event.target.value || undefined;
    emit({ ...filters, position });

  };

  const clearFilters = () => {
    emit({});
    
  };

  return (
    <div className="filter-controls">
      <h3>Filter Players</h3>

      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="team-filter">Team:</label>
          <select
            id="team-filter"
            value={filters.team || ""}
            onChange={handleTeamChange}
          >
            <option value="">All Teams</option>
            {_availableTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="position-filter">Position:</label>
          <select
            id="position-filter"
            value={filters.position || ""}
            onChange={handlePositionChange}
          >
            <option value="">All Positions</option>
            {_availablePositions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={clearFilters} className="clear-filters">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default PlayerFilterControls;
