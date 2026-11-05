import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HomePageState } from "../../../lib/types/screen";
import { Product } from "../../../lib/types/product";

// No hardcoded seed anymore — both arrays fill in from the real backend
// via ProductService (see index.tsx).
const initialState: HomePageState = {
  popularProducts: [],
  dealProducts: [],
};

const homePageSlice = createSlice({
  name: "homePage",
  initialState,
  reducers: {
    setPopularProducts: (state, action: PayloadAction<Product[]>) => {
      state.popularProducts = action.payload;
    },
    setDealProducts: (state, action: PayloadAction<Product[]>) => {
      state.dealProducts = action.payload;
    },
  },
});

export const { setPopularProducts, setDealProducts } = homePageSlice.actions;

const HomePageReducer = homePageSlice.reducer;
export default HomePageReducer;
