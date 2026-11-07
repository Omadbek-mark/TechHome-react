import { expect, it } from 'vitest';
import { specValue, visibleSpecRows, hasDiscount } from './specs';
import { Product } from '../types/product';
import { ProductCategory } from '../enums/product.enum';
it('distinguishes a known zero from missing data and hides specifications for other categories', () => {
  const product = { productCategory: ProductCategory.LAUNDRY, loadKg: 8, warrantyYears: 0, productPrice: 42 } as Product;
  expect(specValue(product, 'warrantyYears', 'years')).toBe('0 years');
  expect(specValue(product, 'widthCm', 'cm')).toBe('Not provided');
  expect(visibleSpecRows([product]).some(row => row.key === 'loadKg')).toBe(true);
  expect(visibleSpecRows([product]).some(row => row.key === 'capacityLiters')).toBe(false);
  expect(hasDiscount({ ...product, productOldPrice: 42 })).toBe(false);
});
