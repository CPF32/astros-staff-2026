import React, { useMemo, useState } from "react";
import { Pitch } from "../types";
import { downloadCsv } from "../utils/export";

interface PitchTableProps {
  pitches: Pitch[];
  playerNameById?: Map<number, string>;
  isLoading?: boolean;
  error?: string;
}

type SortKey = "game_date" | "pitch_type" | "release_speed" | "pitcher" | "batter";

const PAGE_SIZE = 9;

const PitchTable: React.FC<PitchTableProps> = ({
  pitches,
  playerNameById,
  isLoading = false,
  error,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("game_date");
  const [desc, setDesc] = useState(true);
  const [page, setPage] = useState(1);

  const sortedPitches = useMemo(() => {
    const arr = [...pitches];

    arr.sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");

      if (sortKey === "release_speed") {
        const na = Number.parseFloat(av || "0");
        const nb = Number.parseFloat(bv || "0");
        return desc ? nb - na : na - nb;
      }
      return desc ? bv.localeCompare(av) : av.localeCompare(bv);

    });

    return arr;
  }, [pitches, sortKey, desc]);

  const totalPages = Math.max(1, Math.ceil(sortedPitches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedPitches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (next: SortKey) => {
    setPage(1);
    if (sortKey === next) setDesc((v) => !v);

    else {
      setSortKey(next);
      setDesc(false);
    }
  };

  const exportCurrent = () => {
    downloadCsv(pageRows, "pitches.csv", [
      { key: "rowid", label: "rowid" },
      { key: "game_date", label: "game_date" },
      { key: "pitch_type", label: "pitch_type" },
      { key: "release_speed", label: "release_speed" },
      { key: "pitcher", label: "pitcher" },
      { key: "batter", label: "batter" },
      { key: "description", label: "description" },
      { key: "events", label: "events" },
    ]);
  };

  const displayPlayer = (id: number) => {
    return playerNameById?.get(id) ?? String(id);
  };

  const formatResult = (raw: unknown): string => {
    const s = typeof raw === "string" ? raw.trim() : "";
    
    if (!s) return "";
    return s.split("_").join(" ");
  };

  if (isLoading) return <div className="loading">Loading pitches...</div>;
  if (error) return <div className="error">{error}</div>;
  if (pitches.length === 0) return <div className="no-data">No pitches loaded yet.</div>;

  return (
    <div className="table-card">
      <div className="table-header">
        <h4>Pitches ({pitches.length})</h4>
        <div className="table-actions">
          <button className="btn" onClick={exportCurrent}>Export current page</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><button className="sort-btn" onClick={() => toggleSort("game_date")}>Date</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("pitch_type")}>Type</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("release_speed")}>Speed</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("pitcher")}>Pitcher</button></th>
              <th><button className="sort-btn" onClick={() => toggleSort("batter")}>Batter</button></th>
              <th>Result</th>
              <th>Spin rate</th>
              <th>Rel X</th>
              <th>Rel Z</th>
              <th>Plate X</th>
              <th>Plate Z</th>
              <th>Launch speed</th>
              <th>Launch angle</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((pitch, idx) => (
              <tr key={pitch.rowid ?? `${pitch.game_date}-${idx}`}>
                <td>{pitch.game_date}</td>
                <td>{pitch.pitch_type ?? ""}</td>
                <td>{pitch.release_speed ?? ""}</td>
                <td>{displayPlayer(pitch.pitcher)}</td>
                <td>{displayPlayer(pitch.batter)}</td>
                <td>{formatResult(pitch.description ?? pitch.events ?? "")}</td>
                <td>{pitch.release_spin_rate ?? ""}</td>
                <td>{pitch.release_pos_x ?? ""}</td>
                <td>{pitch.release_pos_z ?? ""}</td>
                <td>{pitch.plate_x ?? ""}</td>
                <td>{pitch.plate_z ?? ""}</td>
                <td>{pitch.launch_speed ?? ""}</td>
                <td>{pitch.launch_angle ?? ""}</td>
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

export default PitchTable;
