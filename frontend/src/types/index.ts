export interface Player {
  player_id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  birth_country: string | null;
  birth_state: string | null;
  height_feet: number;
  height_inches: number;
  weight: number;
  team: string;
  primary_position: string;
  throws: string;
  bats: string;
}

export interface Pitch {
  rowid?: number;
  pitch_type: string | null;
  game_date: string;
  pitcher: number;
  batter: number;
  release_speed: string | null;
  release_spin_rate: string | null;
  release_pos_x: string | null;
  release_pos_z: string | null;
  plate_x: number | null;
  plate_z: number | null;
  zone: number | null;
  type: string | null;
  description: string | null;
  events: string | null;
  balls: number | null;
  strikes: number | null;
  outs_when_up: number | null;
  inning: number | null;
  inning_topbot: string | null;
  launch_speed: string | null;
  launch_angle: string | null;
  hit_distance_sc: string | null;
  stand: string | null;
  p_throws: string | null;
  home_team: string | null;
  away_team: string | null;
}

export interface PlayerFilterOptions {
  team?: string;
  position?: string;
  name?: string;
  throws?: string;
  bats?: string;
}

export interface PitchFilterOptions {
  pitcher?: number;
  batter?: number;
  game_date?: string;
  pitch_type?: string;
  min_speed?: number;
  max_speed?: number;
  min_release_pos_x?: number;
  max_release_pos_x?: number;
  min_release_pos_z?: number;
  max_release_pos_z?: number;
  min_spin_rate?: number;
  max_spin_rate?: number;
}

export interface ApiMetrics {
  requests_total: number;
  endpoint_counts: Record<string, number>;
  status_counts: Record<string, number>;
  last_request_ms: number;
}
