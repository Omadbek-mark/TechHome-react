import { Product } from "./product";
import { Order } from "./order";

export interface HomePageState {
  popularProducts: Product[];
  dealProducts: Product[];
}

export interface ProductsPageState {
  products: Product[];
  chosenProduct: Product | null;
}

export interface OrdersPageState {
  pausedOrders: Order[];
  processOrders: Order[];
  finishedOrders: Order[];
}

export interface AppRootState {
  homePage: HomePageState;
  productsPage: ProductsPageState;
  ordersPage: OrdersPageState;
}
