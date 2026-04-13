export function formatPriceYen(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
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
