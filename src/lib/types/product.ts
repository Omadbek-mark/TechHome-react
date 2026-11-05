import { ProductCategory, ProductStatus, EnergyClass } from "../enums/product.enum";

export interface Product {
  _id: string;
  productName: string;
  productCategory: ProductCategory;
  productStatus: ProductStatus;
  productPrice: number;
  productOldPrice?: number;
  installmentLastMonth?: number;
  brand?: string;
  model?: string;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  capacityLiters?: number;
  loadKg?: number;
  noiseDb?: number;
  energyKwhPerYear?: number;
  coolingCapacityBtu?: number;
  dustCapacityLiters?: number;
  screenSizeInches?: number;

  productLeftCount: number;
  productDesc: string;
  productImages: string[];
  productViews: number;
  installmentMonths: number;
  installmentMonthly?: number;
  energyClass?: EnergyClass;
  warrantyYears?: number;
}

export interface ProductInquiry {
  page: number;
  limit: number;
  order?: string;
  productCategory?: ProductCategory;
  search?: string;
  brand?: string;
  onSale?: boolean; // true = only products with a real discount (backend-filtered)
}
export interface ProductPage { items: Product[]; total: number; page: number; limit: number; }
