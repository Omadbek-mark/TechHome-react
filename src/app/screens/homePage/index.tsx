import { useI18n } from '../../../lib/i18n';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import Box from "@mui/material/Box";
import { Alert, Button } from "@mui/material";
import Statistics from "./Statistics";
import PromoBanner from "./PromoBanner";
import Deals from "./Deals";
import { useAppDispatch } from "../../hooks";
import { setPopularProducts, setDealProducts } from "./slice";
import { retrievePopularProducts, retrieveDealProducts } from "./selector";
import ProductService from "../../services/ProductService";
import "../../../css/home.css";
import PopularProducts from "./PopularProducts";

/** REDUX SLICE & SELECTOR **/
const homePageRetriever = createSelector(retrievePopularProducts, retrieveDealProducts, (popularProducts, dealProducts) => ({
  popularProducts,
  dealProducts,
}));

export default function HomePage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { popularProducts, dealProducts } = useSelector(homePageRetriever);

  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState({ popular: "loading", deals: "loading" });
  useEffect(() => {
    let active = true;
    setStatus({ popular: "loading", deals: "loading" });
    const product = new ProductService();

    product
      .getProducts({ page: 1, limit: 4, order: "productViews" })
      .then((data) => { if (active) { dispatch(setPopularProducts(data)); setStatus(value => ({ ...value, popular: "ready" })); } })
      .catch(() => { if (active) setStatus(value => ({ ...value, popular: "error" })); });

    product
      .getProducts({ page: 1, limit: 4, onSale: true })
      .then((data) => { if (active) { dispatch(setDealProducts(data)); setStatus(value => ({ ...value, deals: "ready" })); } })
      .catch(() => { if (active) setStatus(value => ({ ...value, deals: "error" })); });
    return () => { active = false; };
  }, [dispatch, attempt]);

  return (
    <Box className="homepage">
      <Statistics />
      {status.popular === "ready" ? <PopularProducts products={popularProducts} /> : <Box className="th-container">{status.popular === "loading" ? <p role="status">{t("Loading popular products…")}</p> : <Alert severity="error">{t("Popular products could not be loaded.")}<Button onClick={() => setAttempt(value => value + 1)}>{t("Retry products")}</Button></Alert>}</Box>}
      {status.deals === "ready" ? <Deals products={dealProducts} /> : <Box className="th-container">{status.deals === "loading" ? <p role="status">{t("Loading deals…")}</p> : <Alert severity="error">{t("Deals could not be loaded.")}<Button onClick={() => setAttempt(value => value + 1)}>{t("Retry deals")}</Button></Alert>}</Box>}
      <PromoBanner />
    </Box>
  );
}
