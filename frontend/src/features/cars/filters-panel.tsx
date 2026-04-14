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
  compact?: boolean;
}

export function FiltersPanel({ initialQuery, onApply, compact = false }: FiltersPanelProps) {
  const [draft, setDraft] = useState<CarsQuery>(initialQuery);

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
    <Card className={compact ? "p-4" : "p-5"}>
      <div className="grid grid-cols-1 gap-3">
        <Input
          placeholder="Brand"
          value={draft.brand ?? ""}
          onChange={(event) => setField("brand", event.target.value)}
        />
        <Input
          placeholder="Model"
          value={draft.model ?? ""}
          onChange={(event) => setField("model", event.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Year from"
            value={draft.yearFrom ?? ""}
            onChange={(event) => setField("yearFrom", event.target.value)}
          />
          <Input
            type="number"
            placeholder="Year to"
            value={draft.yearTo ?? ""}
            onChange={(event) => setField("yearTo", event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Price min (RUB)"
            value={draft.priceMin ?? ""}
            onChange={(event) => setField("priceMin", event.target.value)}
          />
          <Input
            type="number"
            placeholder="Price max (RUB)"
            value={draft.priceMax ?? ""}
            onChange={(event) => setField("priceMax", event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Mileage min"
            value={draft.mileageMin ?? ""}
            onChange={(event) => setField("mileageMin", event.target.value)}
          />
          <Input
            type="number"
            placeholder="Mileage max"
            value={draft.mileageMax ?? ""}
            onChange={(event) => setField("mileageMax", event.target.value)}
          />
        </div>
        <Select
          value={
            draft.isAvailable === undefined ? "any" : draft.isAvailable ? "true" : "false"
          }
          onChange={(event) => setField("isAvailable", event.target.value)}
        >
          <option value="any">Availability: any</option>
          <option value="true">Only available</option>
          <option value="false">Only unavailable</option>
        </Select>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
          <Button onClick={() => onApply({ ...draft, page: 1 })}>Show cars</Button>
        </div>
      </div>
    </Card>
  );
}
