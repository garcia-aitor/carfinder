const DEFAULT_JPY_TO_RUB_RATE = 0.62;

function getJpyToRubRate(): number {
  const rawRate = process.env.NEXT_PUBLIC_JPY_TO_RUB_RATE;
  const parsedRate = rawRate ? Number(rawRate) : NaN;

  if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
    return DEFAULT_JPY_TO_RUB_RATE;
  }

  return parsedRate;
}

const jpyToRubRate = getJpyToRubRate();

export function convertYenToRub(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return Math.round(value * jpyToRubRate);
}

export function convertRubToYen(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return Math.round(value / jpyToRubRate);
}

export function formatPriceRubFromYen(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Negotiable";
  }

  const rubValue = convertYenToRub(value);

  if (rubValue === undefined) {
    return "Negotiable";
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(rubValue);
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
