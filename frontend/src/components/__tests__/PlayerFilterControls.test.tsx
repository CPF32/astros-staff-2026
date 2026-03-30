import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import PlayerFilterControls from "../PlayerFilterControls";

describe("PlayerFilterControls", () => {
  test("emits filter payload when team changes", () => {
    const onFilterChange = vi.fn();
    
    render(
      <PlayerFilterControls
        onFilterChange={onFilterChange}
        availableTeams={["HOU"]}
        availablePositions={["SS"]}
        players={[
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
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("Team"), {
      target: { value: "HOU" },
    });

    expect(onFilterChange).toHaveBeenCalled();
    expect(onFilterChange.mock.calls[0][0]).toMatchObject({ team: "HOU" });
  });
});
