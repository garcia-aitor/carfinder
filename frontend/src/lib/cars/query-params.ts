import type { CarsQuery, CarsSortBy, SortOrder } from "@/lib/api/types";

const DEFAULT_LIMIT = 24;

function toNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: string | null): boolean | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }
  return undefined;
}

const sortBySet = new Set<CarsSortBy>(["createdAt", "priceYen", "mileageKm", "year"]);
const sortOrderSet = new Set<SortOrder>(["asc", "desc"]);

function toSortBy(value: string | null): CarsSortBy | undefined {
  if (!value || !sortBySet.has(value as CarsSortBy)) {
    return undefined;
  }
  return value as CarsSortBy;
}

function toSortOrder(value: string | null): SortOrder | undefined {
  if (!value || !sortOrderSet.has(value as SortOrder)) {
    return undefined;
  }
  return value as SortOrder;
}

export function parseCarsQuery(params: URLSearchParams): CarsQuery {
  return {
    brand: params.get("brand") || undefined,
    model: params.get("model") || undefined,
    yearFrom: toNumber(params.get("yearFrom")),
    yearTo: toNumber(params.get("yearTo")),
    priceMin: toNumber(params.get("priceMin")),
    priceMax: toNumber(params.get("priceMax")),
    mileageMin: toNumber(params.get("mileageMin")),
    mileageMax: toNumber(params.get("mileageMax")),
    isAvailable: toBoolean(params.get("isAvailable")),
    page: toNumber(params.get("page")) ?? 1,
    limit: toNumber(params.get("limit")) ?? DEFAULT_LIMIT,
    sortBy: toSortBy(params.get("sortBy")) ?? "createdAt",
    sortOrder: toSortOrder(params.get("sortOrder")) ?? "desc",
  };
}

export function toSearchParams(query: CarsQuery): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  return params;
}
