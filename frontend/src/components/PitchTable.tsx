import React from "react";
import { Pitch } from "../types";

interface PitchTableProps {
  pitches: Pitch[];
  isLoading?: boolean;
  error?: string;
}

const pitchKey = (p: Pitch, index: number): string => p.rowid != null ? String(p.rowid) : `${p.game_date}-${p.pitcher}-${p.batter}-${index}`;

const PitchTable: React.FC<PitchTableProps> = ({
  pitches,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="player-table">
        <div className="loading">Loading pitches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-table">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="player-table">
        <div className="no-data">
          No pitches loaded. Use filters above and click Search.
        </div>
      </div>
    );
  }

  return (
    <div className="player-table">
      <h2>Pitches ({pitches.length} pitches)</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Speed</th>
              <th>Pitcher id</th>
              <th>Batter id</th>
              <th>Result</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {pitches.map((pitch, index) => (
              <tr key={pitchKey(pitch, index)}>
                <td>{pitch.game_date}</td>
                <td>{pitch.pitch_type ?? ""}</td>
                <td>{pitch.release_speed ?? ""}</td>
                <td>{pitch.pitcher}</td>
                <td>{pitch.batter}</td>
                <td>{pitch.description ?? ""}</td>
                <td>{pitch.events ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PitchTable;
