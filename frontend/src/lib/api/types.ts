export interface LoginResponse {
  accessToken: string;
}

export interface AuthUser {
  sub: string;
  username: string;
}

export interface Car {
  id: string;
  listingUrl: string;
  externalId: string | null;
  brand: string | null;
  fullTitle: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  mileageKm: number | null;
  priceYen: number | null;
  engineCc: number | null;
  sellerName: string | null;
  sellerUrl: string | null;
  mainPhotoUrl: string | null;
  photoUrls: unknown;
  raw: unknown;
  isAvailable: boolean;
  lastSeenRunId: string | null;
  missingRuns: number;
  firstSeenAt: string;
  lastSeenAt: string;
  disappearedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CarsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CarsListResponse {
  data: Car[];
  meta: CarsListMeta;
}

export interface CarDetailResponse {
  data: Car;
}

export type CarsSortBy =
  | "priceYen"
  | "mileageKm"
  | "year"
  | "createdAt"
  | "firstSeenAt";
export type SortOrder = "asc" | "desc";

export interface CarsQuery {
  brand?: string;
  yearFrom?: number;
  yearTo?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: CarsSortBy;
  sortOrder?: SortOrder;
}
