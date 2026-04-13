import { Suspense } from "react";
import { CarsCatalogClient } from "@/features/cars/cars-catalog-client";
import { Card } from "@/components/ui/card";

export default function CarsPage() {
  return (
    <Suspense fallback={<Card className="h-[420px] animate-pulse bg-surface-alt" />}>
      <CarsCatalogClient />
    </Suspense>
  );
}
