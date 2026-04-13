import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_KEY = "carfinder_access_token";

const protectedRoutes = ["/cars"];
const guestOnlyRoutes = ["/login"];

function isProtected(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isGuestOnly(pathname: string): boolean {
  return guestOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (isProtected(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly(pathname) && token) {
    return NextResponse.redirect(new URL("/cars", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cars/:path*", "/login"],
};
