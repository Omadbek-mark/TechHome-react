import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import HomePageReducer from "./screens/homePage/slice";
import ProductsPageReducer from "./screens/productsPage/slice";
import OrdersPageReducer from "./screens/ordersPage/slice";

const reducers = combineReducers({
    homePage: HomePageReducer,
    productsPage: ProductsPageReducer,
    ordersPage: OrdersPageReducer,
});

export const store = configureStore({
  reducer: (state: ReturnType<typeof reducers> | undefined, action: Action) => {
    if (state && action.type === "session/cleared") {
      state = { ...state, ordersPage: OrdersPageReducer(undefined, action), productsPage: { ...state.productsPage, chosenProduct: null } };
    }
    return reducers(state, action);
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
