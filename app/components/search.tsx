import type { Location } from "@remix-run/react";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import useDebounce from "react-use/esm/useDebounce";
import { Input } from "./ui/input";

export function Search() {
  const [searchParams] = useSearchParams();
  const [val, setVal] = useState(searchParams.get("search") || undefined);
  const location = useLocation();
  const navigate = useNavigate();

  useDebounce(
    () => {
      if (val) {
        const to = getSearchLink(val, searchParams, location);
        navigate(to, {
          preventScrollReset: true,
          replace: true,
        });
        return;
      }

      const to = getRemoveSearchLink(searchParams, location);
      navigate(to, {
        replace: true,
        preventScrollReset: true,
      });
    },
    200,
    [val]
  );

  return (
    <Input
      className="w-[500px] h-14 px-5 rounded-full text-lg max-w-full"
      value={val}
      onChange={({ currentTarget }) => {
        setVal(currentTarget.value);
      }}
      placeholder="Search"
      required
    />
  );
}

function getSearchLink(
  search: string,
  params: URLSearchParams,
  location: Location
) {
  params.set("search", search);
  return `${location.pathname}?${params.toString()}`;
}

function getRemoveSearchLink(params: URLSearchParams, location: Location) {
  params.delete("search");
  return `${location.pathname}?${params.toString()}`;
}
