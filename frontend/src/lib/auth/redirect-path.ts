/**
 * Internal path only — blocks open redirects (e.g. //evil.com).
 */
export function getSafeRedirectPath(redirectTo: string | null): string {
  if (!redirectTo || typeof redirectTo !== "string") {
    return "/cars";
  }
  const trimmed = redirectTo.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/cars";
  }
  if (trimmed.includes("\0")) {
    return "/cars";
  }
  return trimmed;
}
