"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCarById } from "@/lib/api/endpoints";
import { mapCarToViewModel } from "@/lib/dictionary/car-view-model";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

interface CarDetailClientProps {
  id: string;
}

export function CarDetailClient({ id }: CarDetailClientProps) {
  const query = useQuery({
    queryKey: ["car", id],
    queryFn: () => getCarById(id),
  });

  if (query.isLoading) {
    return <Card className="h-[420px] animate-pulse bg-surface-alt" />;
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <p className="text-danger">Failed to load car details.</p>
        <Button className="mt-3" variant="secondary" onClick={() => query.refetch()}>
          Retry
        </Button>
      </Card>
    );
  }

  const view = mapCarToViewModel(query.data.data);
  const photos = view.photoUrls.length > 0 ? view.photoUrls : [view.mainPhotoUrl ?? fallbackImage];

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="relative h-72 w-full md:h-[430px]">
          <Image
            src={view.mainPhotoUrl ?? fallbackImage}
            alt={view.title}
            fill
            className="rounded-xl object-cover"
            sizes="100vw"
          />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-5">
        {photos.slice(0, 10).map((photo) => (
          <div key={photo} className="relative h-24 overflow-hidden rounded-lg border border-border">
            <Image src={photo} alt={view.title} fill className="object-cover" sizes="200px" />
          </div>
        ))}
      </div>

      <Card>
        <p className="text-sm text-text-secondary">{view.brandLabel}</p>
        <h1 className="mt-1 text-2xl font-semibold">{view.title}</h1>
        <p className="mt-2 text-3xl font-semibold text-accent">{view.priceLabel}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Specifications</h2>
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-text-secondary">Model</dt>
            <dd>{view.modelLabel}</dd>
            <dt className="text-text-secondary">Year</dt>
            <dd>{view.yearLabel}</dd>
            <dt className="text-text-secondary">Mileage</dt>
            <dd>{view.mileageLabel}</dd>
            <dt className="text-text-secondary">Engine</dt>
            <dd>{view.engineLabel}</dd>
            <dt className="text-text-secondary">Color</dt>
            <dd>{view.colorLabel}</dd>
            <dt className="text-text-secondary">Status</dt>
            <dd>{view.statusLabel}</dd>
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Seller</h2>
          <p className="mt-4 text-sm text-text-secondary">Name</p>
          <p className="text-base">{view.sellerName}</p>
          {view.sellerUrl ? (
            <Link
              href={view.sellerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-accent"
            >
              Open seller page
            </Link>
          ) : null}
          <Link
            href={view.listingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-accent"
          >
            Open original listing
          </Link>
        </Card>
      </div>
    </div>
  );
}
