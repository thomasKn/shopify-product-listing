import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getFiltersFromParam } from "~/components/filters";
import { SortParam } from "~/components/sort";
import { Product } from "~/type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Mock API Call
 */
export async function fetchProducts(request: Request) {
  const data = await fetch(
    atob(
      "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2JvbmFtc3Jpa2FudGgxL3Nlbmlvci13ZWJkZXYtdGVzdC84NTZhMDkwYjM0YTZiYmFlM2ZkNDc0ODNiYzk3MDNlZmY3ZWI3NDg5L3NhbXBsZS1kYXRhLmpzb24="
    )
  );

  if (!data.ok) {
    throw new Response("Failed to fetch data", {
      status: 404,
    });
  }

  const products: Product[] = await data.json();

  return filterAndSortProducts(products, request);
}

/**
 *
 * In a real Hydrogen app, this function should not exists. Shopify should return
 * filtered and sorted products based on the GraphQL query.
 */
export function filterAndSortProducts(
  products: Product[],
  request: Request
): Product[] {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("search") || null;
  const sort: SortParam | null =
    (searchParams.get("sort") as SortParam) || null;
  const { filters } = getFiltersFromParam(searchParams);

  /**
   * Filter products by search term
   */
  const searchProducts = products.filter((product) => {
    if (!search) {
      return true;
    }

    return product.title.toLowerCase().includes(search.toLowerCase());
  });

  /**
   * Sort products by sort param
   */
  const sortProducts = searchProducts.sort((a, b) => {
    if (!sort) {
      return 0;
    }

    if (sort === "atoz") {
      return a.title.localeCompare(b.title) || 0;
    }

    if (sort === "ztoa") {
      return b.title.localeCompare(a.title) || 0;
    }

    if (sort === "low") {
      return (
        parseFloat(a.variants.nodes[0].price.amount) -
        parseFloat(b.variants.nodes[0].price.amount)
      );
    }

    if (sort === "high") {
      return (
        parseFloat(b.variants.nodes[0].price.amount) -
        parseFloat(a.variants.nodes[0].price.amount)
      );
    }

    return 0;
  });

  if (filters.length === 0) {
    return sortProducts;
  }

  /**
   * Filter products by availability filterAndSortProducts
   */
  const filteredByAvailability = sortProducts.filter((product) => {
    const firstVariant = product.variants.nodes[0];

    const availabilityFilters = filters.filter((filter) => {
      return typeof filter.available === "boolean";
    });

    if (availabilityFilters.length === 2 || availabilityFilters.length === 0) {
      return true;
    }

    return firstVariant.availableForSale === availabilityFilters[0].available;
  });

  /**
   * Filter products by variant option
   */
  const filteredByVariantOption = filteredByAvailability.filter((product) => {
    const firstVariant = product.variants.nodes[0];

    const variantOptionFilters = filters.filter((filter) => {
      return typeof filter.variantOption?.value === "string";
    });

    if (variantOptionFilters.length === 0) {
      return true;
    }

    // Check if any variant option matches the provided options
    for (const option of firstVariant.selectedOptions) {
      for (const filter of variantOptionFilters) {
        if (
          option.name.toLowerCase() === filter.variantOption?.name.toLowerCase()
        ) {
          if (option.value === filter.variantOption?.value) {
            return true; // Match found, include the product
          }
        }
      }
    }
  });

  /**
   * Filter products by price
   */
  const filteredByPrice = filteredByVariantOption.filter((product) => {
    const firstVariant = product.variants.nodes[0];

    const priceFilters = filters.filter((filter) => {
      return (
        typeof filter.price?.min === "number" ||
        typeof filter.price?.max === "number"
      );
    });

    if (priceFilters.length === 0) {
      return true;
    }

    for (const filter of priceFilters) {
      if (
        filter.price?.min &&
        parseFloat(firstVariant.price.amount) < filter.price.min
      ) {
        return false;
      }
      if (
        filter.price?.max &&
        parseFloat(firstVariant.price.amount) > filter.price.max
      ) {
        return false;
      }

      return true;
    }
  });

  return filteredByPrice;
}
