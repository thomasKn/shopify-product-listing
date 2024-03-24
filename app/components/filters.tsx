import type { Location } from "@remix-run/react";

import { IconFilters } from "./icons/icon-filter";
import { cx } from "class-variance-authority";
import { buttonVariants } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import { SyntheticEvent, useCallback, useMemo, useState } from "react";
import { Input } from "./ui/input";
import useDebounce from "react-use/esm/useDebounce";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

type Option = { input: ProductFilter; label: string };

export const FILTER_URL_PREFIX = "filter.";

const colors = [
  "FED Green",
  "Reactive Blue",
  "Sea Green / Desert",
  "Syntax",
] as const;

const allFilters = [
  {
    name: "a",
    label: "Availability",
    type: "checkbox",
    options: [
      {
        input: JSON.stringify({ available: true }),
        label: "In stock",
      },
      {
        input: JSON.stringify({ available: false }),
        label: "Out of stock",
      },
    ],
  },
  {
    name: "p",
    label: "Price",
    type: "range",
  },
  {
    name: "c",
    label: "Color",
    type: "checkbox",
    options: [
      ...colors.map((color) => ({
        input: JSON.stringify({
          variantOption: { name: "color", value: color },
        }),
        label: color,
      })),
    ],
  },
  {
    name: "s",
    label: "Sizes",
    type: "checkbox",
    options: [
      {
        input: JSON.stringify({
          variantOption: { name: "size", value: "154cm" },
        }),
        label: "154cm",
      },
    ],
  },
] as const;

export function Filters() {
  const [params] = useSearchParams();
  const { filters: appliedFilters } = getFiltersFromParam(params);

  return (
    <Sheet>
      <SheetTrigger
        className={cx(buttonVariants({ variant: "ghost" }), "!size-12")}
      >
        <IconFilters />
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll" side="left">
        <SheetHeader>
          <SheetTitle className="text-2xl">Filter products</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col mt-8 gap-5">
          {allFilters.map((filter) => (
            <div key={filter.name}>
              <h3 className="font-semibold text-xl">{filter.label}</h3>
              <div className="mt-2">
                {filter.type === "checkbox" ? (
                  <div className="flex flex-col gap-1">
                    {filter.options?.map((option) => (
                      <CheckboxFilter
                        appliedFilters={appliedFilters}
                        key={Math.random()}
                        option={option as Option}
                      />
                    ))}
                  </div>
                ) : (
                  <PriceRangeFilter />
                )}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CheckboxFilter({
  option,
  appliedFilters,
}: {
  option: Option;
  appliedFilters: ProductFilter[];
}) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const addFilterLink = getFilterLink(option.input, params, location);
  const appliedFilter = getAppliedFilter(option, appliedFilters);
  const filterIsApplied = !!appliedFilter;

  const removeFilterLink = useMemo(() => {
    if (!appliedFilter) {
      return location.pathname;
    }
    return getAppliedFilterLink(appliedFilter, params, location);
  }, [appliedFilter, params, location]);

  const handleToggleFilter = useCallback(() => {
    const navigateTo = filterIsApplied ? removeFilterLink : addFilterLink;
    navigate(navigateTo, {
      preventScrollReset: true,
      replace: true,
    });
  }, [addFilterLink, navigate, removeFilterLink, filterIsApplied]);

  return (
    <div className="flex items-center gap-2" key={option.label}>
      <Checkbox
        checked={filterIsApplied}
        onCheckedChange={handleToggleFilter}
        id={option.label}
      />
      <label
        className="cursor-pointer hover:opacity-65 transition-opacity select-none"
        htmlFor={option.label}
      >
        {option.label}
      </label>
    </div>
  );
}

const PRICE_RANGE_FILTER_DEBOUNCE = 500;

export function PriceRangeFilter() {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
  const price = priceFilter
    ? (JSON.parse(priceFilter) as ProductFilter["price"])
    : undefined;
  const min = isNaN(Number(price?.min)) ? undefined : Number(price?.min);
  const max = isNaN(Number(price?.max)) ? undefined : Number(price?.max);
  const navigate = useNavigate();
  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  useDebounce(
    () => {
      if (minPrice === undefined && maxPrice === undefined) {
        params.delete(`${FILTER_URL_PREFIX}price`);
        navigate(`${location.pathname}?${params.toString()}`, {
          preventScrollReset: true,
          replace: true,
        });
        return;
      }

      const price = {
        ...(minPrice === undefined ? {} : { min: minPrice }),
        ...(maxPrice === undefined ? {} : { max: maxPrice }),
      };
      const newParams = filterInputToParams({ price }, params);
      navigate(`${location.pathname}?${newParams.toString()}`, {
        preventScrollReset: true,
        replace: true,
      });
    },
    PRICE_RANGE_FILTER_DEBOUNCE,
    [minPrice, maxPrice]
  );

  const onChangeMax = (event: SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const newMaxPrice = Number.isNaN(parseFloat(value))
      ? undefined
      : parseFloat(value);
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event: SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const newMinPrice = Number.isNaN(parseFloat(value))
      ? undefined
      : parseFloat(value);
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="px-2">
        <span>From</span>
        <Input
          className="mt-1"
          min={0}
          name="minPrice"
          onChange={onChangeMin}
          placeholder={"$"}
          type="number"
          value={minPrice ?? ""}
        />
      </label>
      <label className="px-2">
        <span>To</span>
        <Input
          className="mt-1"
          min={0}
          name="maxPrice"
          onChange={onChangeMax}
          placeholder={"$"}
          type="number"
          value={maxPrice ?? ""}
        />
      </label>
    </div>
  );
}

function getAppliedFilterLink(
  filter: ProductFilter,
  params: URLSearchParams,
  location: Location
) {
  const paramsClone = new URLSearchParams(params);
  Object.entries(filter).forEach(([key, value]) => {
    const fullKey = FILTER_URL_PREFIX + key;
    paramsClone.delete(fullKey, JSON.stringify(value));
  });
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getFilterLink(
  rawInput: ProductFilter | string,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(rawInput, paramsClone);
  return `${location.pathname}?${newParams.toString()}`;
}

function filterInputToParams(
  rawInput: ProductFilter | string,
  params: URLSearchParams
) {
  const input =
    typeof rawInput === "string"
      ? (JSON.parse(rawInput) as ProductFilter)
      : rawInput;

  Object.entries(input).forEach(([key, value]) => {
    if (params.has(`${FILTER_URL_PREFIX}${key}`, JSON.stringify(value))) {
      return;
    }
    if (key === "price") {
      // For price, we want to overwrite
      params.set(`${FILTER_URL_PREFIX}${key}`, JSON.stringify(value));
    } else {
      params.append(`${FILTER_URL_PREFIX}${key}`, JSON.stringify(value));
    }
  });

  return params;
}

export function getFiltersFromParam(searchParams: URLSearchParams) {
  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        const filterKey = key.substring(FILTER_URL_PREFIX.length);
        filters.push({
          [filterKey]: JSON.parse(value),
        });
      }
      return filters;
    },
    [] as ProductFilter[]
  );

  return {
    filters,
  };
}

function getAppliedFilter(option: Option, appliedFilters: ProductFilter[]) {
  return appliedFilters.find((appliedFilter) => {
    return JSON.stringify(appliedFilter) === option.input;
  });
}
