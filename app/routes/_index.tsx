import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import { Filters } from "~/components/filters";
import { ProductGrid } from "~/components/product-grid";
import { Search } from "~/components/search";
import { Sort } from "~/components/sort";
import { fetchProducts } from "~/lib/utils";
import type { Product } from "~/type";

export async function loader({ request }: LoaderFunctionArgs) {
  const products: Product[] = await fetchProducts(request);
  const productsPerPage = 9;
  const searchParams = new URL(request.url).searchParams;
  const page = searchParams.get("page") || null;
  /**
   * Here we simulate a products pagination using the `page` query param
   * so we can implement a product loaded on scroll functionality.
   */
  const totalPages = Math.ceil(products.length / productsPerPage);
  const end = page ? Number(page) * productsPerPage : productsPerPage;
  const paginatedProducts = products.slice(0, end);

  return json({
    collection: {
      products: paginatedProducts,
      pageInfo: {
        hasNextPage: totalPages > Number(page) && products.length > end,
      },
    },
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main>
      <section className="dark bg-background text-foreground">
        <div className="py-28">
          <div className="flex space-y-8 justify-center flex-col items-center container">
            <h1 className="text-5xl font-bold">Latest arrivals</h1>
            <Search />
          </div>
        </div>
      </section>
      <section className="container my-20 space-y-10">
        <div className="flex items-center justify-between">
          <div className="inline-flex">
            <Filters />
          </div>
          <div className="inline-flex">
            <Sort />
          </div>
        </div>
        <ProductGrid />
      </section>
    </main>
  );
}
