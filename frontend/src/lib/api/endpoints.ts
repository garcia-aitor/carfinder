"use client";

import { apiClient } from "./client";
import type {
  AuthUser,
  CarDetailResponse,
  CarsListResponse,
  CarsQuery,
  LoginResponse,
} from "./types";

function buildCarsQuery(query: CarsQuery): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, String(value));
  }

  return params;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    username,
    password,
  });
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
}

export async function getCars(query: CarsQuery): Promise<CarsListResponse> {
  const params = buildCarsQuery(query);
  const { data } = await apiClient.get<CarsListResponse>(
    `/cars${params.size > 0 ? `?${params.toString()}` : ""}`,
  );
  return data;
}

export async function getCarById(id: string): Promise<CarDetailResponse> {
  const { data } = await apiClient.get<CarDetailResponse>(`/cars/${id}`);
  return data;
}
