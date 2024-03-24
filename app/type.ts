import { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";

export type Product = {
  id: string;
  title: string;
  publishedAt: string;
  handle: string;
  vendor: string;
  variants: {
    nodes: {
      id: string;
      availableForSale: boolean;
      image: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
      price: MoneyV2;
      compareAtPrice: MoneyV2 | null;
      selectedOptions: {
        name: string;
        value: string;
      }[];
      product: {
        handle: string;
        title: string;
      };
    }[];
  };
};
