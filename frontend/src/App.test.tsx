import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import ApiService from "./services/api";

vi.mock("./services/api", () => ({
  default: {
    getPlayers: vi.fn(),
    getPitches: vi.fn(),
    healthCheck: vi.fn(),
  },

}));

const apiMock = ApiService as unknown as {
  getPlayers: ReturnType<typeof vi.fn>;
  getPitches: ReturnType<typeof vi.fn>;
  healthCheck: ReturnType<typeof vi.fn>;
};

describe("App Component", () => {
  test("loads and renders players", async () => {
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
    ]);

    render(<App />);

    expect(
      screen.getByRole("heading", { name: /Baseball Player Statistics/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Player")).toBeInTheDocument();
    });
    
  });
});
