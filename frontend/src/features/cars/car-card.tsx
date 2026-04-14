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
    <Card className="overflow-hidden p-0 transition-colors hover:bg-surface-alt">
      <Link href={`/cars/${car.id}`} className="block">
        <div className="relative h-52 w-full bg-black/20">
          <Image
            src={cardImage}
            alt={car.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={car.statusLabel === "Available" ? "success" : "default"}
          >
            {car.statusLabel}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-text-secondary">{car.brandLabel}</p>
          <Link
            href={`/cars/${car.id}`}
            className="mt-1 block text-lg font-semibold"
          >
            {car.modelLabel}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-text-secondary">
          <span>Year: {car.yearLabel}</span>
          <span>Mileage: {car.mileageLabel}</span>
          <span>Engine: {car.engineLabel}</span>
          <span>Color: {car.colorLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xl font-semibold text-accent">{car.priceLabel}</p>
          <Link
            href={`/cars/${car.id}`}
            className="text-sm font-semibold text-text-primary"
          >
            Details
          </Link>
        </div>
      </div>
    </Card>
  );
}
