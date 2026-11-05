import { createSelector } from "@reduxjs/toolkit";
import { AppRootState } from "../../../lib/types/screen";

const selectHomePage = (state: AppRootState) => state.homePage;

export const retrievePopularProducts = createSelector(selectHomePage, (HomePage) => HomePage.popularProducts);

export const retrieveDealProducts = createSelector(selectHomePage, (HomePage) => HomePage.dealProducts);
