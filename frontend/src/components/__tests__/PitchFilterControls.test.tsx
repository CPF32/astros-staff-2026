import { describe, test, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PitchFilterControls from "../PitchFilterControls";

describe("PitchFilterControls", () => {
  test("keeps core filters visible and opens advanced dialog", () => {
    const onSearch = vi.fn();
    render(<PitchFilterControls onSearch={onSearch} players={[]} />);

    expect(screen.getByLabelText("Player")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Advanced pitch filters" }));
    expect(screen.getByRole("dialog", { name: "Advanced pitch filters" })).toBeInTheDocument();
    expect(screen.getByLabelText("Pitch type")).toBeInTheDocument();
    expect(screen.getByLabelText("Min mph")).toBeInTheDocument();
    expect(screen.getByLabelText("Max spin rate")).toBeInTheDocument();
  });

  test("search resolves player names and sends filters", () => {
    const onSearch = vi.fn();
    
    render(
      <PitchFilterControls
        onSearch={onSearch}
        players={[
          {
            player_id: 99,
            first_name: "Max",
            last_name: "Scherzer",
            birthdate: "1984-07-27",
            birth_country: null,
            birth_state: null,
            height_feet: 6,
            height_inches: 3,
            weight: 208,
            team: "TOR",
            primary_position: "LHR",
            throws: "R",
            bats: "R",
          },
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("Player"), {
      target: { value: "Max Scherzer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Advanced pitch filters" }));
    fireEvent.change(screen.getByLabelText("Pitch type"), { target: { value: "SL" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ pitcher: 99, pitch_type: "SL" }));
  });
});
