import type { Location } from "@remix-run/react";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCallback } from "react";
import { buttonVariants } from "./ui/button";
import { cx } from "class-variance-authority";

const sortValues = [
  { value: "atoz", label: "Alphabetically - A to Z" },
  { value: "ztoa", label: "Alphabetically - Z to A" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
] as const;

export type SortParam = (typeof sortValues)[number]["value"];

export function Sort() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleSort = useCallback(
    (value: SortParam) => {
      const to = getSortLink(value, params, location);
      navigate(to, {
        preventScrollReset: true,
        replace: true,
      });
    },
    [params, location, navigate]
  );

  return (
    <Select
      value={params.get("sort") || sortValues[0].value}
      onValueChange={(value: SortParam) => handleToggleSort(value)}
    >
      <SelectTrigger
        className={cx(
          buttonVariants({ variant: "ghost" }),
          "h-12 select-none inline-flex border-0"
        )}
      >
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {sortValues.map((sortValue) => (
            <SelectItem key={sortValue.value} value={sortValue.value}>
              {sortValue.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function getSortLink(
  sort: SortParam,
  params: URLSearchParams,
  location: Location
) {
  params.set("sort", sort);
  return `${location.pathname}?${params.toString()}`;
}
