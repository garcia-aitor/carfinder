"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { getCars } from "@/lib/api/endpoints";
import type { CarsQuery, CarsSortBy, SortOrder } from "@/lib/api/types";
import { parseCarsQuery, toSearchParams } from "@/lib/cars/query-params";
import { mapCarToViewModel } from "@/lib/dictionary/car-view-model";
import { convertRubToYen, convertYenToRub } from "@/lib/formatters";
import { CarCard } from "./car-card";
import { FiltersPanel } from "./filters-panel";

const sortOptions: Array<{ label: string; sortBy: CarsSortBy; sortOrder: SortOrder }> = [
  { label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Price low to high", sortBy: "priceYen", sortOrder: "asc" },
  { label: "Price high to low", sortBy: "priceYen", sortOrder: "desc" },
  { label: "Mileage low to high", sortBy: "mileageKm", sortOrder: "asc" },
  { label: "Mileage high to low", sortBy: "mileageKm", sortOrder: "desc" },
  { label: "Year new to old", sortBy: "year", sortOrder: "desc" },
  { label: "Year old to new", sortBy: "year", sortOrder: "asc" },
];

export function CarsCatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useMemo(() => parseCarsQuery(new URLSearchParams(searchParams)), [searchParams]);

  const queryResult = useQuery({
    queryKey: ["cars", query],
    queryFn: () => getCars(query),
    placeholderData: keepPreviousData,
  });

  const updateQuery = (next: CarsQuery) => {
    const params = toSearchParams({
      ...query,
      ...next,
    });
    router.push(`/cars?${params.toString()}`);
  };

  const selectedSort = `${query.sortBy}:${query.sortOrder}`;
  const cards = (queryResult.data?.data ?? []).map(mapCarToViewModel);
  const filtersQuery = useMemo(
    () => ({
      ...query,
      priceMin: convertYenToRub(query.priceMin),
      priceMax: convertYenToRub(query.priceMax),
    }),
    [query],
  );

  const applyFilters = (next: CarsQuery) => {
    updateQuery({
      ...next,
      priceMin: convertRubToYen(next.priceMin),
      priceMax: convertRubToYen(next.priceMax),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 md:hidden">
        <p className="text-sm text-text-secondary">
          {queryResult.data?.meta.total ?? 0} cars found
        </p>
        <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
          Filters
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden self-start lg:sticky lg:top-20 lg:block">
          <FiltersPanel initialQuery={filtersQuery} onApply={applyFilters} />
        </aside>

        <section className="space-y-4">
          <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-text-secondary">
              Found: <span className="text-text-primary">{queryResult.data?.meta.total ?? 0}</span>
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-text-secondary">Sort by</span>
              <Select
                value={selectedSort}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split(":") as [
                    CarsSortBy,
                    SortOrder,
                  ];
                  updateQuery({ sortBy, sortOrder, page: 1 });
                }}
              >
                {sortOptions.map((option) => (
                  <option
                    key={`${option.sortBy}:${option.sortOrder}`}
                    value={`${option.sortBy}:${option.sortOrder}`}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          {queryResult.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="h-[390px] animate-pulse bg-surface-alt" />
              ))}
            </div>
          ) : null}

          {queryResult.isError ? (
            <Card>
              <p className="text-danger">Failed to load cars. Please try again.</p>
              <Button className="mt-3" variant="secondary" onClick={() => queryResult.refetch()}>
                Retry
              </Button>
            </Card>
          ) : null}

          {!queryResult.isLoading && !queryResult.isError && cards.length === 0 ? (
            <Card>
              <p className="text-text-secondary">No cars match your current filters.</p>
            </Card>
          ) : null}

          {!queryResult.isLoading && !queryResult.isError && cards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : null}

          <Pagination
            currentPage={queryResult.data?.meta.page ?? query.page ?? 1}
            totalPages={queryResult.data?.meta.totalPages ?? 1}
            onChange={(page) => updateQuery({ page })}
          />
        </section>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/65 p-4 lg:hidden">
          <div className="mx-auto mt-10 max-w-md">
            <FiltersPanel
              initialQuery={filtersQuery}
              onApply={(next) => {
                applyFilters(next);
                setFiltersOpen(false);
              }}
              compact
            />
            <Button className="mt-3 w-full" variant="secondary" onClick={() => setFiltersOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
