"use client";

const TOKEN_STORAGE_KEY = "carfinder_access_token";
const TOKEN_COOKIE_KEY = "carfinder_access_token";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const item = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!item) {
    return null;
  }
  return decodeURIComponent(item.split("=").slice(1).join("="));
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_TTL_SECONDS}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const fromStorage = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (fromStorage) {
    return fromStorage;
  }

  return readCookie(TOKEN_COOKIE_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  writeCookie(TOKEN_COOKIE_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  clearCookie(TOKEN_COOKIE_KEY);
}
