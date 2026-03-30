import axios, { AxiosError, isAxiosError } from "axios";
import {
  Player,
  PlayerFilterOptions,
  Pitch,
  PitchFilterOptions,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function messageFromAxiosError(error: AxiosError): string {
  if (error.response) {
    const { status, statusText, data } = error.response;
    
    if (data != null && typeof data === "object" && !Array.isArray(data)) {
      const err = (data as Record<string, unknown>).error;
      if (typeof err === "string" && err.length > 0) return err;
      
      const msg = (data as Record<string, unknown>).message;
      if (typeof msg === "string" && msg.length > 0) return msg;
    }

    if (typeof data === "string" && data.length > 0) return data;
    
    const tail = statusText ? ` ${statusText}` : "";
    return `${status}${tail}`.trim() || "Request failed";
  }

  if (error.code === "ECONNABORTED") {
    return "Request timed out.";
  }

  if (error.request) {
    return "No response from the API. Check that the backend is running.";
  }

  return error.message || "Request failed";
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60_000,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      return Promise.reject(new Error(messageFromAxiosError(error)));
    }

    if (error instanceof Error) {
      return Promise.reject(error);
    }

    return Promise.reject(new Error("Request failed"));
  }
);

export class ApiService {
  static async getPlayers(filters?: PlayerFilterOptions): Promise<Player[]> {
    const { data } = await api.get<Player[]>("/players", {
      params: filters,
    });

    return data;
  }

  static async getPitches(filters?: PitchFilterOptions): Promise<Pitch[]> {
    const { data } = await api.get<Pitch[]>("/pitches", {
      params: filters,
    });

    return data;
  }

  static async healthCheck(): Promise<{ status: string }> {
    const { data } = await api.get<{ status: string }>("/health");
    
    return data;
  }
}

export default ApiService;
