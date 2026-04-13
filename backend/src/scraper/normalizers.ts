const BASE_URL = "https://www.carsensor.net";

export function cleanText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `${BASE_URL}${url}`;
  }

  return `${BASE_URL}/${url}`;
}

export function normalizePhotoUrl(
  url: string | null | undefined,
): string | null {
  const absolute = toAbsoluteUrl(url);
  if (!absolute) {
    return null;
  }

  return absolute.replace(/_s(\.(?:jpg|jpeg|png|webp))$/i, "$1");
}

export function parsePriceYen(rawPrice: string | null): number | null {
  if (!rawPrice) {
    return null;
  }

  const normalized = rawPrice.replace(/,/g, "").replace(/\s+/g, "");
  const manMatch = normalized.match(/(\d+(?:\.\d+)?)万円/);
  if (manMatch) {
    return Math.round(Number(manMatch[1]) * 10000);
  }

  const yenMatch = normalized.match(/(\d+)/);
  if (!yenMatch) {
    return null;
  }

  const numeric = Number(yenMatch[1]);
  // On CarSensor, main price blocks are often shown as "480" + separate "万円" text.
  if (numeric > 0 && numeric < 10000) {
    return numeric * 10000;
  }

  return numeric;
}

export function parseMileageKm(rawMileage: string | null): number | null {
  if (!rawMileage) {
    return null;
  }

  const normalized = rawMileage.replace(/,/g, "").replace(/\s+/g, "");
  const manMatch = normalized.match(/(\d+(?:\.\d+)?)万km/i);
  if (manMatch) {
    return Math.round(Number(manMatch[1]) * 10000);
  }

  const kmMatch = normalized.match(/(\d+(?:\.\d+)?)km/i);
  return kmMatch ? Math.round(Number(kmMatch[1])) : null;
}

export function parseYear(rawYear: string | null): number | null {
  if (!rawYear) {
    return null;
  }

  const match = rawYear.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

export function parseEngineCc(rawEngine: string | null): number | null {
  if (!rawEngine) {
    return null;
  }

  const match = rawEngine.replace(/,/g, "").match(/(\d+)CC/i);
  return match ? Number(match[1]) : null;
}

export function extractModelFromTitle(fullTitle: string | null): string | null {
  if (!fullTitle) {
    return null;
  }

  // Keep KISS: model is everything before the first displacement number.
  const parts = fullTitle.split(/\s+\d+(?:\.\d+)?\s*/);
  return cleanText(parts[0] ?? fullTitle);
}
