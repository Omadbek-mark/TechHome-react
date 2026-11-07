export interface CartItem {
  _id: string;
  quantity: number;
  /** Catalog hint only. Backend remains authoritative. */
  stock?: number;
  name: string;
  price: number;
  image: string;
}