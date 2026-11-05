import { expect, it, vi } from "vitest";
import axios from "axios";
import { api } from "../../lib/api/client";
import ProductService from "./ProductService";
import { productsData } from "../../lib/data/products";

it("returns the API catalog data without inventing prices or stock", async () => {
  const products = [{ ...productsData[0], productPrice: 0, productLeftCount: 0 }];
  const request = vi.spyOn(axios, "get").mockResolvedValue({ data: products });
  expect(await new ProductService().getProducts({ page: 1, limit: 8 })).toBe(products);
  expect(request).toHaveBeenCalledWith("http://api.test.invalid/product/all?page=1&limit=8");
});

it("propagates an API failure instead of returning demo products", async () => {
  const error = new Error("offline fixture");
  vi.spyOn(api, "get").mockRejectedValue(error);
  await expect(new ProductService().getProduct("missing")).rejects.toBe(error);
});

it('requests paginated catalog with encoded text and preserves server totals', async () => {
  const data = { items: [], total: 19, page: 3, limit: 8 };
  const request = vi.spyOn(axios, 'get').mockResolvedValue({ data });
  expect(await new ProductService().getCatalog({ page: 3, limit: 8, search: 'A&B + Pro', onSale: true })).toBe(data);
  const url = new URL(request.mock.calls[0][0]);
  expect(url.pathname).toBe('/product/catalog');
  expect(url.searchParams.get('search')).toBe('A&B + Pro');
  expect(url.searchParams.get('onSale')).toBe('true');
});
