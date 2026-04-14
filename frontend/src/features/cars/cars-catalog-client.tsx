"use client";

import { useEffect, useMemo, useState } from "react";
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

const sortOptions: Array<{
  label: string;
  sortBy: CarsSortBy;
  sortOrder: SortOrder;
}> = [
  {
    label: "First seen newest to oldest",
    sortBy: "firstSeenAt",
    sortOrder: "desc",
  },
  {
    label: "First seen oldest to newest",
    sortBy: "firstSeenAt",
    sortOrder: "asc",
  },
  { label: "Price low to high", sortBy: "priceYen", sortOrder: "asc" },
  { label: "Price high to low", sortBy: "priceYen", sortOrder: "desc" },
  { label: "Mileage low to high", sortBy: "mileageKm", sortOrder: "asc" },
  { label: "Mileage high to low", sortBy: "mileageKm", sortOrder: "desc" },
  { label: "Year new to old", sortBy: "year", sortOrder: "desc" },
  { label: "Year old to new", sortBy: "year", sortOrder: "asc" },
];
const itemsPerPageOptions = [12, 24, 48] as const;

export function CarsCatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => parseCarsQuery(new URLSearchParams(searchParams)),
    [searchParams],
  );

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
  const [draftFiltersQuery, setDraftFiltersQuery] =
    useState<CarsQuery>(filtersQuery);
  const [debouncedDraftFiltersQuery, setDebouncedDraftFiltersQuery] =
    useState<CarsQuery>(filtersQuery);

  useEffect(() => {
    setDraftFiltersQuery(filtersQuery);
  }, [filtersQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedDraftFiltersQuery(draftFiltersQuery);
    }, 800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [draftFiltersQuery]);

  const countPreviewQuery = useMemo(
    () => ({
      ...debouncedDraftFiltersQuery,
      priceMin: convertRubToYen(debouncedDraftFiltersQuery.priceMin),
      priceMax: convertRubToYen(debouncedDraftFiltersQuery.priceMax),
      page: 1,
      limit: 12,
    }),
    [debouncedDraftFiltersQuery],
  );
  const countPreviewResult = useQuery({
    queryKey: ["cars-count-preview", countPreviewQuery],
    queryFn: () => getCars(countPreviewQuery),
    placeholderData: keepPreviousData,
  });

  const applyFilters = (next: CarsQuery) => {
    updateQuery({
      ...next,
      priceMin: convertRubToYen(next.priceMin),
      priceMax: convertRubToYen(next.priceMax),
    });
  };

  return (
    <div className="space-y-5">
      <section className="space-y-8">
        <FiltersPanel
          initialQuery={filtersQuery}
          onDraftChange={setDraftFiltersQuery}
          onApply={(next) => {
            applyFilters(next);
          }}
          resultCount={
            countPreviewResult.data?.meta.total ??
            queryResult.data?.meta.total ??
            0
          }
          isCounting={countPreviewResult.isFetching}
        />

        <Pagination
          currentPage={queryResult.data?.meta.page ?? query.page ?? 1}
          totalPages={queryResult.data?.meta.totalPages ?? 1}
          onChange={(page) => updateQuery({ page })}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold text-[#1d1d1d]">
            Cars found: {queryResult.data?.meta.total ?? 0}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <span className="whitespace-nowrap text-sm text-text-secondary">
                Sort by:
              </span>
              <Select
                className="min-w-[190px] bg-white"
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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <span className=" whitespace-nowrap text-sm text-text-secondary">
                Items per page:
              </span>
              <Select
                className="min-w-[120px] bg-white"
                value={String(query.limit ?? 24)}
                onChange={(event) => {
                  updateQuery({ limit: Number(event.target.value), page: 1 });
                }}
              >
                {itemsPerPageOptions.map((limit) => (
                  <option key={limit} value={limit}>
                    {limit}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {queryResult.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card
                key={idx}
                className="h-[390px] animate-pulse bg-surface-alt"
              />
            ))}
          </div>
        ) : null}

        {queryResult.isError ? (
          <Card>
            <p className="text-danger">
              Failed to load cars. Please try again.
            </p>
            <Button
              className="mt-3"
              variant="secondary"
              onClick={() => queryResult.refetch()}
            >
              Retry
            </Button>
          </Card>
        ) : null}

        {!queryResult.isLoading &&
        !queryResult.isError &&
        cards.length === 0 ? (
          <Card>
            <p className="text-text-secondary">
              No cars match your current filters.
            </p>
          </Card>
        ) : null}

        {!queryResult.isLoading && !queryResult.isError && cards.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  );
}
