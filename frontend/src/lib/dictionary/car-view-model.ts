import type { Car } from "@/lib/api/types";
import {
  formatEngineCc,
  formatMileageKm,
  formatPriceRubFromYen,
  formatYear,
} from "@/lib/formatters";
import {
  normalizeBrand,
  normalizeCarTerm,
  normalizeColor,
  normalizeModel,
  normalizeTextOrFallback,
} from "./jp-to-en";

export interface CarViewModel {
  id: string;
  title: string;
  brandLabel: string;
  modelLabel: string;
  colorLabel: string;
  yearLabel: string;
  mileageLabel: string;
  priceLabel: string;
  engineLabel: string;
  sellerName: string;
  sellerUrl: string | null;
  listingUrl: string;
  mainPhotoUrl: string | null;
  photoUrls: string[];
  statusLabel: string;
  badges: string[];
}

function toPhotoUrls(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

export function mapCarToViewModel(car: Car): CarViewModel {
  const title = normalizeModel(car.fullTitle ?? car.model, car.brand);
  const model = normalizeModel(car.model ?? car.fullTitle, car.brand);
  const badges = [car.model, car.fullTitle]
    .map((entry) => normalizeCarTerm(entry))
    .filter((item) => item !== "N/A")
    .slice(0, 2);

  return {
    id: car.id,
    title,
    brandLabel: normalizeBrand(car.brand),
    modelLabel: model,
    colorLabel: normalizeColor(car.color),
    yearLabel: formatYear(car.year),
    mileageLabel: formatMileageKm(car.mileageKm),
    priceLabel: formatPriceRubFromYen(car.priceYen),
    engineLabel: formatEngineCc(car.engineCc),
    sellerName: normalizeTextOrFallback(car.sellerName),
    sellerUrl: car.sellerUrl,
    listingUrl: car.listingUrl,
    mainPhotoUrl: car.mainPhotoUrl,
    photoUrls: toPhotoUrls(car.photoUrls),
    statusLabel: car.isAvailable ? "Available" : "Unavailable",
    badges,
  };
}
