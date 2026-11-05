import { ProductCategory } from '../enums/product.enum';
import { ProductInquiry } from '../types/product';
const keys = ['page','limit','order','productCategory','search','brand','onSale'];
export function parseCatalog(search: string): ProductInquiry {
  const params = new URLSearchParams(search);
  const single = (key: string) => params.getAll(key).length === 1 ? params.get(key)! : undefined;
  const integer = (key: string, fallback: number, max: number) => {
    const value = single(key); const number = Number(value);
    return value && /^\d+$/.test(value) && number >= 1 && number <= max ? number : fallback;
  };
  const order = single('order'), category = single('productCategory');
  const result: ProductInquiry = { page: integer('page', 1, 100000), limit: integer('limit', 8, 50), order: ['createdAt','productPrice','priceDesc','productViews'].includes(order ?? '') ? order : 'createdAt' };
  if (Object.values(ProductCategory).includes(category as ProductCategory)) result.productCategory = category as ProductCategory;
  for (const key of ['search','brand'] as const) {
    const value = single(key)?.trim();
    if (value && value.length <= (key === 'search' ? 100 : 80)) result[key] = value;
  }
  if (single('onSale') === 'true') result.onSale = true;
  return result;
}
export function catalogSearch(input: ProductInquiry, existing = ''): string {
  const params = new URLSearchParams(existing);
  keys.forEach(key => params.delete(key));
  for (const [key,value] of Object.entries(input)) if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
  return `?${params.toString()}`;
}
