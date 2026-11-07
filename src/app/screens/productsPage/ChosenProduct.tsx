import { useI18n } from '../../../lib/i18n';
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useGlobals } from "../../hooks/useGlobals";
import { useParams } from "react-router-dom"; // @ts-ignore
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setChosenProduct } from "./slice";
import { createSelector } from "reselect";
import { Product } from "../../../lib/types/product";
import { retrieveChosenProduct } from "./selector";
import ProductService from "../../services/ProductService";
import { Alert } from "@mui/material";
import { CompareButton } from "./Comparison";
import { hasDiscount, productImage, visibleSpecRows, specValue } from "../../../lib/catalog/specs";
import { CartItem } from "../../../lib/types/search";
import "../../../css/products.css";

/** REDUX SLICE & SELECTOR **/
const actionDispatch = (dispatch: Dispatch) => ({
  setChosenProduct: (data: Product) => dispatch(setChosenProduct(data)),
});
const chosenProductRetriever = createSelector(
retrieveChosenProduct, (chosenProduct) => ({ chosenProduct })
);

interface ChosenProductProps {
  onAdd: (item: CartItem) => void;
}

export default function ChosenProduct(props: ChosenProductProps) {
  const { t } = useI18n();
  const { onAdd } = props;
  const { authState, authMember } = useGlobals();
  const { productId } = useParams<{ productId: string }>();
  const { setChosenProduct } = actionDispatch(useDispatch());
  const { chosenProduct } = useSelector(chosenProductRetriever);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loadedId, setLoadedId] = useState("");
  useEffect(() => {
    if (authState === "loading") return;
    let active = true; setLoading(true); setError("");
    new ProductService().getProduct(productId).then(data => {
      if (active) { setChosenProduct(data); setLoadedId(productId); setLoading(false); }
    }).catch(() => { if (active) { setError("Product could not be loaded or is no longer available."); setLoading(false); } });
    return () => { active = false; };
  }, [productId, authState, authMember?._id, retry]);
  if (error) return <Alert severity="error">{t(error)}<Button onClick={() => setRetry(value => value + 1)}>{t("Retry product")}</Button></Alert>;
  if (loading || loadedId !== productId || !chosenProduct) return <p role="status">{t("Loading product…")}</p>;

  const inStock = chosenProduct.productLeftCount > 5;
  const stockLabel = inStock ? t("In stock") : t("{{count}} left", { count: chosenProduct.productLeftCount });

  return (
    <Box>

      <Box component="section" className="th-section">
        <Box className="th-container">
          <Box className="th-detail">
            <Box className="th-detail__media">
              <Swiper
                loop={chosenProduct.productImages.length > 1}
                spaceBetween={10}
                navigation={true}
                observer={true}
                observeParents={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="swiper-area"
                style={{ width: "100%", height: "100%" }}
              >
                {(chosenProduct.productImages.length ? chosenProduct.productImages : [""]).map((ele: string, index: number) => {
                  const imagePath = productImage(ele);
                  return (
                    <SwiperSlide key={index}>
                      <img
                        className="slider-image"
                        src={imagePath}
                        alt={chosenProduct.productName}
                        onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/icons/TechHome.svg"; }}
                        style={{ width: "100%", height: "100%", objectFit: ele ? "cover" : "contain" }}
                      />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </Box>

            <Box>
              <Typography component="span" className="th-product-tile__cat">
                {t(chosenProduct.productCategory)}
              </Typography>
              <Typography component="h1" className="th-detail__name">
                {chosenProduct.productName}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: "14px", margin: "8px 0 16px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--steel)", fontSize: "13px" }}>
                  <RemoveRedEyeIcon fontSize="small" />
                  <span>{chosenProduct.productViews}</span>
                </Box>
              </Box>

              <Typography component="p" className="th-detail__desc">
                {chosenProduct.productDesc ? chosenProduct.productDesc : t("Not provided")}
              </Typography>

              <Box className="th-badge-row">
                {chosenProduct.energyClass && (
                  <Box component="span" className="th-badge th-badge--neutral">
                    {chosenProduct.energyClass}
                  </Box>
                )}
                {typeof chosenProduct.warrantyYears === "number" && (
                  <Box component="span" className="th-badge th-badge--amber">
                    {chosenProduct.warrantyYears === 0 ? t("No warranty") : t("{{count}}yr warranty", { count: chosenProduct.warrantyYears })}
                  </Box>
                )}
              </Box>

              <Box className="th-detail__price-row">
                <span className="th-detail__price">${chosenProduct.productPrice}</span>
                {hasDiscount(chosenProduct) && (
                  <span className="th-detail__old-price">${chosenProduct.productOldPrice}</span>
                )}
              </Box>

              {!!chosenProduct.installmentMonths && !!chosenProduct.installmentMonthly && (
                <Box className="th-detail__installment">
                  {chosenProduct.installmentMonths}{t("months · $")}{chosenProduct.installmentMonthly.toFixed(2)}{t("/month")}{typeof chosenProduct.installmentLastMonth === "number" && t("Final month: ${{amount}}", { amount: chosenProduct.installmentLastMonth.toFixed(2) })}
                </Box>
              )}

              <Typography component="p" className="th-detail__stock">
                {stockLabel}
              </Typography>

              <Box component="dl" className="th-product-specs">{visibleSpecRows([chosenProduct]).map(row => <React.Fragment key={row.key}><dt>{t(row.label)}</dt><dd>{specValue(chosenProduct, row.key, row.unit)}</dd></React.Fragment>)}</Box>
              <CompareButton product={chosenProduct} />
              <Button
                disabled={chosenProduct.productLeftCount <= 0}
                variant="contained"
                sx={{ mt: "20px", background: "var(--forest)", "&:hover": { background: "var(--forest)" } }}
                onClick={(e) => {
                  onAdd({
                    _id: chosenProduct._id,
                    quantity: 1,
                    name: chosenProduct.productName,
                    price: chosenProduct.productPrice,
                    stock: chosenProduct.productLeftCount,
                    image: chosenProduct.productImages[0] ?? "",
                  });
                  e.stopPropagation();
                }}
              >{t("Add To Basket")}</Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}