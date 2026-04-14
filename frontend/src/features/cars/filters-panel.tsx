"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CarsQuery } from "@/lib/api/types";

interface FiltersPanelProps {
  initialQuery: CarsQuery;
  onApply: (query: CarsQuery) => void;
  resultCount?: number;
}

export function FiltersPanel({ initialQuery, onApply, resultCount = 0 }: FiltersPanelProps) {
  const [draft, setDraft] = useState<CarsQuery>(initialQuery);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setDraft(initialQuery);
  }, [initialQuery]);

  const setField = (key: keyof CarsQuery, value: string) => {
    const numericKeys = new Set([
      "yearFrom",
      "yearTo",
      "priceMin",
      "priceMax",
      "mileageMin",
      "mileageMax",
      "limit",
    ]);

    if (key === "isAvailable") {
      let parsed: boolean | undefined;
      if (value === "true") {
        parsed = true;
      } else if (value === "false") {
        parsed = false;
      }
      setDraft((prev) => ({ ...prev, [key]: parsed, page: 1 }));
      return;
    }

    if (numericKeys.has(key)) {
      setDraft((prev) => ({
        ...prev,
        [key]: value === "" ? undefined : Number(value),
        page: 1,
      }));
      return;
    }

    setDraft((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const reset = () => {
    onApply({
      page: 1,
      limit: initialQuery.limit ?? 24,
      sortBy: initialQuery.sortBy ?? "createdAt",
      sortOrder: initialQuery.sortOrder ?? "desc",
    });
  };

  return (
    <Card className="rounded-3xl border-[#eee8d9] p-3 shadow-none md:p-4">
      {!collapsed ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
            <Input
              className="h-11 rounded-xl border-[#ece7db] bg-white"
              placeholder="Brand"
              value={draft.brand ?? ""}
              onChange={(event) => setField("brand", event.target.value)}
            />
            <Input
              className="h-11 rounded-xl border-[#ece7db] bg-white"
              placeholder="Model"
              value={draft.model ?? ""}
              onChange={(event) => setField("model", event.target.value)}
            />
            <Input
              className="h-11 rounded-xl border-[#ece7db] bg-white"
              type="number"
              placeholder="Year from"
              value={draft.yearFrom ?? ""}
              onChange={(event) => setField("yearFrom", event.target.value)}
            />
            <Input
              className="h-11 rounded-xl border-[#ece7db] bg-white"
              type="number"
              placeholder="Year to"
              value={draft.yearTo ?? ""}
              onChange={(event) => setField("yearTo", event.target.value)}
            />
            <div className="relative">
              <Input
                className="h-11 rounded-xl border-[#ece7db] bg-white pr-12"
                type="number"
                placeholder="Price min"
                value={draft.priceMin ?? ""}
                onChange={(event) => setField("priceMin", event.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                RUB
              </span>
            </div>
            <div className="relative">
              <Input
                className="h-11 rounded-xl border-[#ece7db] bg-white pr-12"
                type="number"
                placeholder="Price max"
                value={draft.priceMax ?? ""}
                onChange={(event) => setField("priceMax", event.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                RUB
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Input
                className="h-11 rounded-xl border-[#ece7db] bg-white pr-10"
                type="number"
                placeholder="Mileage min"
                value={draft.mileageMin ?? ""}
                onChange={(event) => setField("mileageMin", event.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                km
              </span>
            </div>
            <div className="relative">
              <Input
                className="h-11 rounded-xl border-[#ece7db] bg-white pr-10"
                type="number"
                placeholder="Mileage max"
                value={draft.mileageMax ?? ""}
                onChange={(event) => setField("mileageMax", event.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                km
              </span>
            </div>
            <Select
              className="h-11 rounded-xl border-[#ece7db] bg-white"
              value={
                draft.isAvailable === undefined ? "any" : draft.isAvailable ? "true" : "false"
              }
              onChange={(event) => setField("isAvailable", event.target.value)}
            >
              <option value="any">Availability: any</option>
              <option value="true">Only available</option>
              <option value="false">Only unavailable</option>
            </Select>
            <Input
              className="h-11 rounded-xl border-[#ece7db] bg-white"
              type="number"
              placeholder="Items per page"
              value={draft.limit ?? ""}
              onChange={(event) => setField("limit", event.target.value)}
            />
            <div className="hidden xl:block" />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 border-t border-[#f0ecdf] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#272727]"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <span aria-hidden="true">{collapsed ? "▾" : "▴"}</span>
          {collapsed ? "Show filters" : "Hide filters"}
        </button>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="ghost" onClick={reset}>
            Reset
          </Button>
          <Button onClick={() => onApply({ ...draft, page: 1 })}>
            Show {resultCount} cars
          </Button>
        </div>
      </div>
    </Card>
  );
}
