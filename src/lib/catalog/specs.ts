import { translate } from '../i18n';
import { ProductCategory } from '../enums/product.enum';
import { Product } from '../types/product';
import { serverApi } from '../config';
export const specRows: { key: keyof Product; label: string; unit?: string; category?: ProductCategory }[] = [
  { key: 'brand', label: 'Brand' }, { key: 'model', label: 'Model' }, { key: 'productCategory', label: 'Category' },
  { key: 'widthCm', label: 'Width', unit: 'cm' }, { key: 'heightCm', label: 'Height', unit: 'cm' }, { key: 'depthCm', label: 'Depth', unit: 'cm' },
  { key: 'capacityLiters', label: 'Kitchen capacity', unit: 'L', category: ProductCategory.KITCHEN }, { key: 'loadKg', label: 'Laundry load', unit: 'kg', category: ProductCategory.LAUNDRY },
  { key: 'coolingCapacityBtu', label: 'Cooling capacity', unit: 'BTU', category: ProductCategory.CLIMATE }, { key: 'dustCapacityLiters', label: 'Dust capacity', unit: 'L', category: ProductCategory.CLEANING },
  { key: 'screenSizeInches', label: 'Screen size', unit: 'inches', category: ProductCategory.ENTERTAINMENT }, { key: 'noiseDb', label: 'Noise', unit: 'dB' },
  { key: 'energyKwhPerYear', label: 'Energy usage', unit: 'kWh/year' }, { key: 'energyClass', label: 'Energy class' },
  { key: 'warrantyYears', label: 'Warranty', unit: 'years' },
];
export const specValue = (product: Product, key: keyof Product, unit = '') => {
  const value = product[key];
  return value === undefined || value === null || value === '' ? translate('Not provided') : `${key === 'productCategory' ? translate(String(value)) : value}${unit ? ` ${translate(unit === 'years' && value === 1 ? 'year' : unit)}` : ''}`;
};
export const hasDiscount = (product: Product) => typeof product.productOldPrice === 'number' && product.productOldPrice > product.productPrice;
export const productImage = (path?: string) => !path ? '/icons/TechHome.svg' : /^https?:\/\//i.test(path) ? path : `${serverApi}/${path.replace(/^\/+/, '')}`;

export const visibleSpecRows = (products: Product[]) => specRows.filter(row => !row.category || products.some(product => product.productCategory === row.category));
