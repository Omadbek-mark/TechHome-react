import { createSelector } from "reselect";
import { AppRootState } from "../../../lib/types/screen";

const selectProductsPage = (state: AppRootState) => state.productsPage;

export const retrieveProducts = createSelector(selectProductsPage, (ProductsPage) => ProductsPage.products);

export const retrieveChosenProduct = createSelector(selectProductsPage, (ProductsPage) => ProductsPage.chosenProduct);