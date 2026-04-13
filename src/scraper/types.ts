export interface CarRecord {
  id: string | null;
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
  listingUrl: string | null;
  mainPhotoUrl: string | null;
  photoUrls: string[];
  raw: {
    year?: string | null;
    mileage?: string | null;
    price?: string | null;
    engine?: string | null;
  };
}

export interface ScrapePageJob {
  runId: string;
  page: number;
}

export interface ScrapeRunSnapshot {
  runId: string;
  totalPages: number;
  startedAt: string;
}
