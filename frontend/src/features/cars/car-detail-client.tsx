"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCarById } from "@/lib/api/endpoints";
import { mapCarToViewModel } from "@/lib/dictionary/car-view-model";
import { normalizeImageUrl } from "@/lib/images/normalize-image-url";

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
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  if (query.isLoading) {
    return <Card className="h-[420px] animate-pulse bg-surface-alt" />;
  }

  if (query.isError || !query.data) {
    return (
      <Card>
        <p className="text-danger">Failed to load car details.</p>
        <Button
          className="mt-3"
          variant="secondary"
          onClick={() => query.refetch()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  const view = mapCarToViewModel(query.data.data);
  const photos = [
    normalizeImageUrl(view.mainPhotoUrl),
    ...view.photoUrls.map((photo) => normalizeImageUrl(photo)),
  ].filter((photo): photo is string => Boolean(photo));
  const uniquePhotos = Array.from(new Set(photos));
  const galleryPhotos =
    uniquePhotos.length > 0 ? uniquePhotos : [fallbackImage];
  const ctaClassName =
    "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors";
  const activePhotoIndex = selectedPhotoUrl
    ? galleryPhotos.indexOf(selectedPhotoUrl)
    : -1;
  const normalizedActivePhotoIndex =
    activePhotoIndex >= 0 ? activePhotoIndex : 0;
  const activePhoto =
    galleryPhotos[normalizedActivePhotoIndex] ??
    galleryPhotos[0] ??
    fallbackImage;
  const canSlide = galleryPhotos.length > 1;

  const showPreviousPhoto = () => {
    setSelectedPhotoUrl((current) => {
      const currentIndex = current ? galleryPhotos.indexOf(current) : 0;
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      if (safeIndex === 0) {
        return galleryPhotos[galleryPhotos.length - 1] ?? null;
      }
      return galleryPhotos[safeIndex - 1] ?? null;
    });
  };

  const showNextPhoto = () => {
    setSelectedPhotoUrl((current) => {
      const currentIndex = current ? galleryPhotos.indexOf(current) : 0;
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      return galleryPhotos[(safeIndex + 1) % galleryPhotos.length] ?? null;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <Card className="overflow-hidden p-0">
            <div className="relative h-[360px] w-full bg-black md:h-[640px]">
              <Image
                src={activePhoto}
                alt={view.title}
                fill
                className="rounded-xl object-contain"
                unoptimized={true}
                priority
              />
              {canSlide ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousPhoto}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg text-white transition hover:bg-black/75"
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    onClick={showNextPhoto}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-lg text-white transition hover:bg-black/75"
                  >
                    &#8250;
                  </button>
                  <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                    {normalizedActivePhotoIndex + 1} / {galleryPhotos.length}
                  </div>
                </>
              ) : null}
            </div>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryPhotos.slice(0, 12).map((photo, idx) => (
              <button
                key={`${photo}-${idx}`}
                type="button"
                onClick={() => setSelectedPhotoUrl(photo)}
                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border transition md:h-24 md:w-28 ${
                  idx === normalizedActivePhotoIndex
                    ? "border-accent ring-2 ring-accent/50"
                    : "border-border hover:border-accent/70"
                }`}
                aria-label={`Show photo ${idx + 1}`}
              >
                <Image
                  src={photo}
                  alt={`${view.title} thumbnail ${idx + 1}`}
                  fill
                  unoptimized={true}
                  className="object-cover"
                  sizes="140px"
                />
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={view.statusLabel === "Available" ? "success" : "default"}
              >
                {view.statusLabel}
              </Badge>
              <Badge variant="accent">{view.yearLabel}</Badge>
            </div>

            <div>
              <p className="text-sm text-text-secondary">{view.brandLabel}</p>
              <h1 className="mt-1 text-4xl font-bold uppercase tracking-tight">
                {view.modelLabel}
              </h1>
            </div>

            <div className="space-y-3 rounded-xl bg-[#111] p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Price</p>
              <p className="text-4xl font-bold text-white">{view.priceLabel}</p>
              <Link
                href={view.listingUrl}
                target="_blank"
                rel="noreferrer"
                className={`${ctaClassName} w-full bg-accent text-black hover:bg-accent-hover`}
              >
                Get offer
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Specifications</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <dt className="text-text-secondary">Mileage</dt>
                <dd>{view.mileageLabel}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <dt className="text-text-secondary">Engine</dt>
                <dd>{view.engineLabel}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <dt className="text-text-secondary">Color</dt>
                <dd>{view.colorLabel}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <dt className="text-text-secondary">Model</dt>
                <dd>{view.modelLabel}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Seller</dt>
                <dd>{view.sellerName}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              {view.sellerUrl ? (
                <Link
                  href={view.sellerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${ctaClassName} border border-border bg-surface text-text-primary hover:bg-surface-alt`}
                >
                  Open seller page
                </Link>
              ) : null}
              <Link
                href={view.listingUrl}
                target="_blank"
                rel="noreferrer"
                className={`${ctaClassName} border border-border bg-surface text-text-primary hover:bg-surface-alt`}
              >
                Open original listing
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
