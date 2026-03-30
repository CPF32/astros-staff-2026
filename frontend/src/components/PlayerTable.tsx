import React, { useMemo, useState } from "react";
import { Player } from "../types";
import { downloadCsv } from "../utils/export";

interface PlayerTableProps {
  players: Player[];
  selectedPlayerId?: number | null;
  onSelectPlayer?: (player: Player) => void;
  isLoading?: boolean;
  error?: string;
}

type SortKey = "name" | "team" | "primary_position" | "throws" | "bats";

const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  selectedPlayerId = null,
  onSelectPlayer,
  isLoading = false,
  error,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [desc, setDesc] = useState(false);
  const [page, setPage] = useState(1);

  const sortedPlayers = useMemo(() => {
    const arr = [...players];

    arr.sort((a, b) => {
      const av = sortKey === "name" ? `${a.last_name}, ${a.first_name}` : String(a[sortKey]);
      const bv = sortKey === "name" ? `${b.last_name}, ${b.first_name}` : String(b[sortKey]);
      return desc ? bv.localeCompare(av) : av.localeCompare(bv);
    });

    return arr;

  }, [players, sortKey, desc]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / 10));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedPlayers.slice((safePage - 1) * 10, safePage * 10);

  const toggleSort = (next: SortKey) => {
    setPage(1);

    if (sortKey === next) setDesc((v) => !v);
    
    else {
      setSortKey(next);
      setDesc(false);
    }
  };

  const exportCurrent = () => {
    downloadCsv(pageRows, "players.csv", [
      { key: "player_id", label: "player_id" },
      { key: "first_name", label: "first_name" },
      { key: "last_name", label: "last_name" },
      { key: "team", label: "team" },
      { key: "primary_position", label: "primary_position" },
      { key: "throws", label: "throws" },
      { key: "bats", label: "bats" },
    ]);
  };

  if (isLoading) return <div className="loading">Loading players...</div>;
  if (error) return <div className="error">{error}</div>;
  if (players.length === 0) return <div className="no-data">No players found.</div>;

  return (
    <div className="table-card">
      <div className="table-header">
        <h4>Players ({players.length})</h4>
        <button className="btn" onClick={exportCurrent}>Export current page</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><button className="sort-btn" onClick={() => toggleSort("name")}>Name</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("team")}>Team</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("primary_position")}>Pos</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("throws")}>Throws</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("bats")}>Bats</button></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((player) => (
              <tr
                key={player.player_id}
                onClick={() => onSelectPlayer?.(player)}
                style={{
                  cursor: onSelectPlayer ? "pointer" : undefined,
                  background:
                    selectedPlayerId != null && player.player_id === selectedPlayerId
                      ? "rgba(0, 127, 255, 0.12)"
                      : undefined,
                }}
                title={onSelectPlayer ? "Click to filter pitches by this player" : undefined}
              >
                <td>{player.first_name} {player.last_name}</td>
                <td>{player.team}</td>
                <td>{player.primary_position}</td>
                <td>{player.throws}</td>
                <td>{player.bats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Page {safePage} / {totalPages}</span>
        <div className="pagination-actions">
          <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default PlayerTable;
