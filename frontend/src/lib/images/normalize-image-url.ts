export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const fileName = parts[parts.length - 1];

    if (!fileName || !fileName.startsWith("S")) {
      return parsed.toString();
    }

    parts[parts.length - 1] = fileName.slice(1);
    parsed.pathname = parts.join("/");
    return parsed.toString();
  } catch {
    return url.replace(/\/S([^/]+)(?=($|[?#]))/, "/$1");
  }
}
