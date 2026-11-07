import { expect, it } from 'vitest';
import { catalogSearch, parseCatalog } from './query';
import { ProductCategory } from '../enums/product.enum';
it('parses and safely round-trips URL filters without splitting search/brand punctuation', () => {
  const query = { page: 3, limit: 8, order: 'priceDesc', search: 'A&B + (Pro)', brand: 'Test & Co', onSale: true, productCategory: ProductCategory.KITCHEN };
  expect(parseCatalog(catalogSearch(query))).toEqual(query);
  expect(new URLSearchParams(catalogSearch(query, '?language=uz')).get('language')).toBe('uz');
});
it('normalizes malformed, duplicated and oversized URL values before the API call', () => {
  expect(parseCatalog('?page=1&page=2&limit=500&order=$where&productCategory=BOGUS&onSale=yes&search=' + 'x'.repeat(101))).toEqual({ page: 1, limit: 8, order: 'createdAt' });
});
