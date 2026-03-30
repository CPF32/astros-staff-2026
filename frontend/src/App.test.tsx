import { describe, test, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import ApiService from "./services/api";

vi.mock("./services/api", () => ({
  default: {
    getPlayers: vi.fn(),
    getPitches: vi.fn(),
    getMetrics: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

const apiMock = ApiService as unknown as {
  getPlayers: ReturnType<typeof vi.fn>;
  getPitches: ReturnType<typeof vi.fn>;
  getMetrics: ReturnType<typeof vi.fn>;
  healthCheck: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.getPlayers.mockResolvedValue([
    {
      player_id: 1,
      first_name: "Test",
      last_name: "Player",
      birthdate: "2000-01-01",
      birth_country: null,
      birth_state: null,
      height_feet: 6,
      height_inches: 0,
      weight: 200,
      team: "HOU",
      primary_position: "SS",
      throws: "R",
      bats: "R",
    },
    {
      player_id: 2,
      first_name: "Pitch",
      last_name: "Guy",
      birthdate: "2000-01-01",
      birth_country: null,
      birth_state: null,
      height_feet: 6,
      height_inches: 0,
      weight: 200,
      team: "HOU",
      primary_position: "LHR",
      throws: "R",
      bats: "R",
    },
  ]);
  apiMock.getPitches.mockResolvedValue([]);
  apiMock.getMetrics.mockResolvedValue({
    requests_total: 2,
    endpoint_counts: { "/api/players": 1 },
    status_counts: { "200": 2 },
    last_request_ms: 12.5,
  });
});

describe("App", () => {
  test("renders loaded player and metrics", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Test Player")).toBeInTheDocument();
    });

    expect(screen.getByText(/Requests:/)).toBeInTheDocument();
  });

  test("clicking player row resets pitcher/batter and applies selected player", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Test Player")).toBeInTheDocument();
      expect(screen.getByText("Pitch Guy")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Test Player"));
    await waitFor(() => {
      expect(apiMock.getPitches).toHaveBeenCalledWith(expect.objectContaining({ batter: 1 }));
    });

    fireEvent.click(screen.getByText("Pitch Guy"));
    await waitFor(() => {
      expect(apiMock.getPitches).toHaveBeenLastCalledWith(expect.objectContaining({ pitcher: 2 }));
      const lastCallArg = apiMock.getPitches.mock.calls[apiMock.getPitches.mock.calls.length - 1][0];
      expect(lastCallArg).not.toHaveProperty("batter");
    });
  });
});
