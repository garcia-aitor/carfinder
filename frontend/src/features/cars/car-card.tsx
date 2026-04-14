import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CarViewModel } from "@/lib/dictionary/car-view-model";
import { normalizeImageUrl } from "@/lib/images/normalize-image-url";

const placeholderImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

interface CarCardProps {
  car: CarViewModel;
}

export function CarCard({ car }: CarCardProps) {
  const cardImage = normalizeImageUrl(car.mainPhotoUrl) ?? placeholderImage;

  return (
    <Link
      href={`/cars/${car.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <Card className="overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-48 w-full bg-black/5">
          <Image
            src={cardImage}
            alt={car.title}
            fill
            className="object-cover"
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={car.statusLabel === "Available" ? "success" : "default"}
            >
              {car.statusLabel}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-m font-bold uppercase tracking-wide text-text-secondary">
              {car.brandLabel}
            </p>
            <h3 className="line-clamp-1 text-xl font-extrabold uppercase leading-tight text-[#1a1a1a]">
              {car.modelLabel}
            </h3>
            <p className="text-xs text-text-secondary">{car.yearLabel}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-secondary">
            <span className="flex flex-col">
              <span>Mileage</span>
              <span className="text-sm text-[#2a2a2a]">{car.mileageLabel}</span>
            </span>
            <span className="flex flex-col">
              <span>Engine</span>
              <span className="text-sm text-[#2a2a2a]">{car.engineLabel}</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-text-secondary">
                Price
              </p>
              <p className="text-2xl font-bold text-accent">{car.priceLabel}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#242424]">
              Details
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
