import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductsPageState } from "../../../lib/types/screen";
import { Product } from "../../../lib/types/product";

// No hardcoded seed anymore — this fills in from the real backend via
// ProductService (see ProductList.tsx / ProductDetail.tsx).
const initialState: ProductsPageState = {
  products: [],
  chosenProduct: null,
};

const productsPageSlice = createSlice({
  name: "productsPage",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setChosenProduct: (state, action: PayloadAction<Product | null>) => {
      state.chosenProduct = action.payload;
    },
  },
});

export const { setProducts, setChosenProduct } = productsPageSlice.actions;

const ProductsPageReducer = productsPageSlice.reducer;
export default ProductsPageReducer;