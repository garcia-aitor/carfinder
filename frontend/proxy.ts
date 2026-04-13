import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_KEY = "carfinder_access_token";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

const protectedRoutes = ["/cars"];

function isProtected(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

function hasUsableToken(rawToken: string | undefined): boolean {
  if (!rawToken) {
    return false;
  }

  const token = rawToken.trim();
  if (!token || token === "undefined" || token === "null") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const payloadText = decodeBase64Url(parts[1]);
  if (!payloadText) {
    return false;
  }

  try {
    const payload = JSON.parse(payloadText) as { exp?: number };
    if (typeof payload.exp === "number") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowSeconds) {
        return false;
      }
    }
  } catch {
    return false;
  }

  return true;
}

async function isTokenAcceptedByApi(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE_KEY)?.value;
  const hasToken = hasUsableToken(token);
  const { pathname } = request.nextUrl;

  if (isProtected(pathname) && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected(pathname) && token) {
    const isValid = await isTokenAcceptedByApi(token);
    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_COOKIE_KEY);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cars/:path*"],
};
