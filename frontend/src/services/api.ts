import axios from "axios";
import { Player, PlayerFilterOptions } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiService {
  /**
   * Get all players or filter by team/position
   */
  static async getPlayers(_filters?: PlayerFilterOptions): Promise<Player[]> {
    // TODO: Implement player retrieval with optional filtering
    throw new Error("getPlayers not implemented");
  }

  // TODO: add additional endpoint calls as needed.

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<{ status: string }> {
    const { data } = await api.get<{ status: string }>("/health");

    return data;
  }
}

export default ApiService;
