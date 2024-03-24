import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { loader } from "~/routes/_index";
import { Button } from "./ui/button";
import { Money, flattenConnection, Image } from "@shopify/hydrogen";
import { Card, CardContent } from "./ui/card";
import { cx } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Product } from "~/type";

export function ProductGrid() {
  const { collection } = useLoaderData<typeof loader>();
  const { products } = collection;

  if (products.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg">No product found</p>
        <Button variant="secondary" asChild className="mt-4">
          <Link to="/">Clear filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="grid md:grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </ul>
      <LoadOnScroll hasNextPage={collection.pageInfo.hasNextPage} />
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const variants =
    product.variants.nodes.length > 0
      ? flattenConnection(product.variants)
      : [];
  const firstVariant = variants[0];
  const inStock = firstVariant?.availableForSale;
  const sale =
    firstVariant?.compareAtPrice &&
    parseFloat(firstVariant.price.amount) <
      parseFloat(firstVariant.compareAtPrice.amount);

  return (
    <Card key={product.id} className="group dark flex flex-col">
      <div className="overflow-hidden relative bg-white aspect-square">
        <Image
          className="group-hover:scale-105 transition duration-500"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          data={{
            width: firstVariant.image.width,
            height: firstVariant.image.height,
            url: firstVariant.image.url,
          }}
        />
        {!inStock && <Badge variant="sold-out" />}
        {inStock && sale && <Badge variant="sale" />}
      </div>
      <CardContent className="mt-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold">{product.title}</h3>
        </div>
        <div className="flex mt-2 gap-3 items-center">
          {firstVariant.compareAtPrice && (
            <Money
              className="line-through"
              data={firstVariant.compareAtPrice}
            />
          )}
          <Money className="text-lg" data={firstVariant.price} />
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ variant }: { variant?: "sold-out" | "sale" }) {
  return (
    <span
      className={cx(
        "inline-flex z-2 top-2 right-2 absolute items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variant === "sold-out" && "bg-gray-200 text-gray-800",
        variant === "sale" && "bg-blue-300 text-blue-900"
      )}
    >
      {variant === "sold-out" ? "Sold out" : "Sale"}
    </span>
  );
}

function LoadOnScroll({ hasNextPage }: { hasNextPage: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const intersectionRef = useRef(null);
  const isInView = useInView(intersectionRef);
  const [loading, setLoading] = useState(false);

  const handlePageChange = useCallback(() => {
    searchParams.set("page", String(page + 1));
    setLoading(false);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
      preventScrollReset: true,
    });
  }, [searchParams, page, location.pathname, navigate]);

  useEffect(
    () => {
      if (isInView && hasNextPage) {
        /**
         * Here we simulate the loading state
         * to reproduce a real life user experience
         */
        setLoading(true);
        const timeout = setTimeout(handlePageChange, 1000);
        return () => clearTimeout(timeout);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isInView, hasNextPage]
  );

  return (
    <div ref={intersectionRef} className="flex justify-center py-2" aria-hidden>
      <svg
        className={cx([
          "animate-spin -ml-1 mr-3 h-5 w-5 transition-opacity",
          loading ? "opacity-100" : "opacity-0",
        ])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}
