export type DisplayCurrency = "EUR" | "USD" | "GBP" | "RUB";

const DEFAULT_JPY_RATES: Record<DisplayCurrency, number> = {
  EUR: 0.0061,
  USD: 0.0066,
  GBP: 0.0052,
  RUB: 0.62,
};

const CURRENCY_LOCALES: Record<DisplayCurrency, string> = {
  EUR: "de-DE",
  USD: "en-US",
  GBP: "en-GB",
  RUB: "ru-RU",
};

export const DISPLAY_PRIMARY_CURRENCY: DisplayCurrency = "EUR";
export const DISPLAY_EXTRA_CURRENCIES: DisplayCurrency[] = ["USD", "GBP", "RUB"];

function getJpyRate(currency: DisplayCurrency): number {
  const envKey = `NEXT_PUBLIC_JPY_TO_${currency}_RATE`;
  const rawRate = process.env[envKey];
  const parsedRate = rawRate ? Number(rawRate) : NaN;

  if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
    return DEFAULT_JPY_RATES[currency];
  }

  return parsedRate;
}

function formatCurrency(value: number, currency: DisplayCurrency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function convertYen(
  value: number | null | undefined,
  currency: DisplayCurrency,
): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return Math.round(value * getJpyRate(currency));
}

export function convertToYen(
  value: number | null | undefined,
  currency: DisplayCurrency,
): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return Math.round(value / getJpyRate(currency));
}

export function formatPriceFromYen(
  value: number | null | undefined,
  currency: DisplayCurrency,
): string {
  if (value === null || value === undefined) {
    return "Negotiable";
  }

  const converted = convertYen(value, currency);

  if (converted === undefined) {
    return "Negotiable";
  }

  return formatCurrency(converted, currency);
}

export function formatExtraPricesFromYen(
  value: number | null | undefined,
  currencies: DisplayCurrency[],
): string {
  if (value === null || value === undefined) {
    return "";
  }

  return currencies
    .map((currency) => formatPriceFromYen(value, currency))
    .filter((formatted) => formatted !== "Negotiable")
    .join(" / ");
}

export function formatMileageKm(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${new Intl.NumberFormat("en-US").format(value)} km`;
}

export function formatEngineCc(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${new Intl.NumberFormat("en-US").format(value)} cc`;
}

export function formatYear(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return String(value);
}
