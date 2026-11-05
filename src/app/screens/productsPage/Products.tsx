import { useI18n } from '../../../lib/i18n';
import React, { ChangeEvent, useState, useEffect, useMemo } from "react";
import { Alert, Box, Button, Container, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Badge from "@mui/material/Badge";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setProducts } from "./slice";
import { createSelector } from "reselect";
import { Product, ProductInquiry } from "../../../lib/types/product";
import { retrieveProducts } from "./selector";
import ProductService from "../../services/ProductService";
import { ProductCategory } from "../../../lib/enums/product.enum";
import { useHistory, useLocation } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";

import { parseCatalog, catalogSearch } from "../../../lib/catalog/query";
import { productImage, hasDiscount } from "../../../lib/catalog/specs";
import { CompareButton } from "./Comparison";

// Swiper importlari
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const categories: (ProductCategory | "ALL")[] = [
  "ALL",
  ProductCategory.KITCHEN,
  ProductCategory.LAUNDRY,
  ProductCategory.CLIMATE,
  ProductCategory.CLEANING,
  ProductCategory.ENTERTAINMENT,
];

const brandLogos = [
  { id: 1, img: "/img/lg11.png", alt: "LG" },
  { id: 2, img: "/img/samsung11.png", alt: "Samsung" },
  { id: 3, img: "/img/artel11.png", alt: "Artel" },
  { id: 4, img: "/img/bosch2.png", alt: "Bosch" },
  { id: 5, img: "/img/beko.png", alt: "Beko" },
  { id: 6, img: "/img/xiaomi2.png", alt: "Xiaomi" },
  { id: 7, img: "/img/midea.png", alt: "Midea" },
];

/** REDUX SLICE & SELECTOR **/
const actionDispatch = (dispatch: Dispatch) => ({
  setProducts: (data: Product[]) => dispatch(setProducts(data)),
});
const productsRetriever = createSelector(
  retrieveProducts, (products) => ({ products })
);

interface ProductsProps {
  onAdd: (item: CartItem) => void;
}

export default function Products(props: ProductsProps) {
  const { t } = useI18n();
  const { onAdd } = props;
  const { setProducts } = actionDispatch(useDispatch());
  const { products } = useSelector(productsRetriever);

  const history = useHistory();
  const location = useLocation();
  const productSearch = useMemo(() => parseCatalog(location.search), [location.search]);
  const [searchText, setSearchText] = useState(productSearch.search ?? "");
  const [brandText, setBrandText] = useState(productSearch.brand ?? "");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => { setSearchText(productSearch.search ?? ""); setBrandText(productSearch.brand ?? ""); }, [productSearch]);
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    new ProductService().getCatalog(productSearch).then(data => {
      if (!active) return;
      setProducts(data.items); setTotal(data.total); setLoading(false);
      const lastPage = Math.max(1, Math.ceil(data.total / data.limit));
      if (data.page > lastPage) history.replace({ ...location, search: catalogSearch({ ...productSearch, page: lastPage }, location.search) });
    }).catch(() => { if (active) { setError("The catalog could not be loaded. Please retry."); setLoading(false); } });
    return () => { active = false; };
  }, [productSearch, retry]);
  const changeFilter = (patch: Partial<ProductInquiry>) => history.push({ ...location, search: catalogSearch({ ...productSearch, ...patch }, location.search) });
  const searchCollectionHandler = (category: ProductCategory | "ALL") => changeFilter({ productCategory: category === "ALL" ? undefined : category, page: 1 });
  const searchOrderHandler = (order: string) => changeFilter({ order, page: 1 });
  const searchProductHandler = () => changeFilter({ search: searchText.trim().slice(0, 100), brand: brandText.trim().slice(0, 80), page: 1 });
  const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => changeFilter({ page });

  const chooseProductHandler = (id: string) => {
    history.push(`/products/${id}`);
  };

  return (
    <div className={"products"}>
      {/* CATALOG HEAD */}
      <Box component="section" className="th-products-head">
        <Box className="th-container">
          <Box className="th-eyebrow">
            <Box component="span" className="th-dot th-dot--forest" />{t("CATALOG")}</Box>
          <Typography component="h1" className="th-heading th-products-head__title">{t("All products")}</Typography>
          <Typography component="p" className="th-products-head__lede">{t("Browse products and check their available specifications.")}</Typography>

          <Box className="th-toolbar">
            <Box className="th-search-box">
              <SearchIcon fontSize="small" />
              <input
                type={"search"}
                aria-label={t("Search products")}
                maxLength={100}
                placeholder={t("Search products")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchProductHandler();
                }}
              />
              <Button className={"th-chip"} onClick={searchProductHandler}>{t("Search")}</Button>
            </Box>

            <Box className="th-search-box"><input aria-label={t("Filter by brand")} placeholder={t("Brand (exact name)")} maxLength={80} value={brandText} onChange={event => setBrandText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') searchProductHandler(); }} /></Box>
            <Box className="th-filter-chips">
              {categories.map((category) => (
                <Button
                  key={category}
                  className={`th-chip ${
                    (productSearch.productCategory ?? "ALL") === category ? "is-active" : ""
                  }`}
                  onClick={() => searchCollectionHandler(category)}
                >
                  {t(category === "ALL" ? "All" : category)}
                </Button>
              ))}
            </Box>

            <Box className="th-filter-chips">
              <Button
                className={`th-chip ${productSearch.order === "createdAt" ? "is-active" : ""}`}
                onClick={() => searchOrderHandler("createdAt")}
              >{t("New")}</Button>
              <Button
                className={`th-chip ${productSearch.order === "productPrice" ? "is-active" : ""}`}
                onClick={() => searchOrderHandler("productPrice")}
              >{t("Price")}</Button>
              <Button className={`th-chip ${productSearch.order === "priceDesc" ? "is-active" : ""}`} onClick={() => searchOrderHandler("priceDesc")}>{t("Price: high first")}</Button>
              <Button aria-pressed={!!productSearch.onSale} className={`th-chip ${productSearch.onSale ? "is-active" : ""}`} onClick={() => changeFilter({ onSale: !productSearch.onSale, page: 1 })}>{t("Deals only")}</Button>
              <Button
                className={`th-chip ${productSearch.order === "productViews" ? "is-active" : ""}`}
                onClick={() => searchOrderHandler("productViews")}
              >{t("Views")}</Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* PRODUCTS LIST */}
      <Box component="section" className="th-section" sx={{ paddingTop: "8px" }}>
        <Box className="th-container">
          {loading && <p role="status">{t("Loading catalog…")}</p>}
          {error && <Alert severity="error">{t(error)}<Button onClick={() => setRetry(value => value + 1)}>{t("Retry catalog")}</Button></Alert>}
          {!loading && !error && <p>{total} {t("products found")}</p>}
          {!loading && !error && (products.length !== 0 ? (
            <Box className="th-grid">
              {products.map((product: Product) => {
                const imagePath = productImage(product.productImages[0]);
                const inStock = product.productLeftCount > 5;
                const stockStatus = inStock ? t("In stock") : t("{{count}} left", { count: product.productLeftCount });
                return (
                  <Box
                    key={product._id}
                    className={"th-card th-product-tile"}
                    role="link" tabIndex={0} aria-label={product.productName} onKeyDown={event => { if (event.target === event.currentTarget && event.key === "Enter") chooseProductHandler(product._id); }}
                    onClick={() => chooseProductHandler(product._id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <Box className={"th-product-tile__media"} sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={imagePath}
                        alt={product.productName}
                        onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/icons/TechHome.svg"; }}
                        loading="lazy"
                        sx={{ width: "100%", height: "100%", objectFit: product.productImages[0] ? "cover" : "contain", display: "block" }}
                      />
                      <Box component="span" className={`th-stock-pip ${inStock ? "" : "th-stock-pip--low"}`}>
                        {stockStatus}
                      </Box>
                      <Button
                        className={"shop-btn"}
                        aria-label={t("Add {{name}} to basket", { name: product.productName })}
                        disabled={product.productLeftCount <= 0}
                        onClick={(e) => {
                          onAdd({
                            _id: product._id,
                            quantity: 1,
                            name: product.productName,
                            price: product.productPrice,
                            stock: product.productLeftCount,
                            image: product.productImages[0] ?? "",
                          });
                          e.stopPropagation();
                        }}
                      >
                        <img src={"/icons/shopping-cart.svg"} style={{ display: "flex" }} alt={t("cart")} />
                      </Button>
                      <Button className={"view-btn"} sx={{ right: "36px" }}>
                        <Badge badgeContent={product.productViews} color="secondary">
                          <RemoveRedEyeIcon
                            sx={{ color: product.productViews === 0 ? "#9aa0a6" : "var(--ink)" }}
                          />
                        </Badge>
                      </Button>
                    </Box>
                    <Box className={"th-product-tile__body"}>
                      <Typography component="span" className={"th-product-tile__cat"}>
                        {t(product.productCategory)}
                      </Typography>
                      <Typography component="span" className={"th-product-tile__name"}>
                        {product.productName}
                      </Typography>

                      <Box className={"th-badge-row"}>
                        {product.energyClass && (
                          <Box component="span" className={"th-badge th-badge--neutral"}>
                            {product.energyClass}
                          </Box>
                        )}
                        {typeof product.warrantyYears === "number" && (
                          <Box component="span" className={"th-badge th-badge--amber"}>
                            {product.warrantyYears === 0 ? t("No warranty") : t("{{count}}yr warranty", { count: product.warrantyYears })}
                          </Box>
                        )}
                      </Box>

                      <Box className={"th-product-tile__foot"}>
                        <Typography component="span" className={"th-product-tile__price"}>
                          ${product.productPrice.toFixed(2)}
                          {hasDiscount(product) && <small>{t("was $")}{product.productOldPrice!.toFixed(2)}</small>}
                        </Typography>
                        {!!product.installmentMonths && !!product.installmentMonthly && (
                          <Box component="span" className={"th-badge th-badge--neutral"}>
                            {product.installmentMonths}{t("mo · $")}{product.installmentMonthly.toFixed(2)}
                          </Box>
                        )}
                      </Box>
                      <CompareButton product={product} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box className="th-empty-state">{t("No products match these filters.")}</Box>
          ))}

          {!loading && !error && total > 0 && <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <Pagination
              getItemAriaLabel={(type, page, selected) => type === "page" ? t(selected ? "Current page {{page}}" : "Go to page {{page}}", { page: page ?? 1 }) : t(type === "next" ? "Next page" : "Previous page")}
              count={Math.ceil(total / productSearch.limit)}
              page={productSearch.page}
              renderItem={(item) => (
                <PaginationItem
                  components={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                  {...item}
                />
              )}
              onChange={paginationHandler}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": { fontFamily: "var(--font-mono)", fontWeight: 600 },
                "& .Mui-selected": { backgroundColor: "var(--forest) !important", color: "#fff !important" },
              }}
            />
          </Box>}
        </Box>
      </Box>

      {/* OUR FAMOUS BRANDS SECTION */}
      <div className={"brands-logo"}>
        <Container className={"family-brands"}>
          <Box className={"category-title"}>{t("Our Famous Brands")}</Box>
          <Swiper
            loop={true}
            spaceBetween={20}
            navigation={true}
            observer={true}
            observeParents={true}
            modules={[Navigation, Autoplay]}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            breakpoints={{
              320: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="swiper-area"
            style={{ width: "100%", padding: "20px 0" }}
          >
            {brandLogos.map((brand) => (
              <SwiperSlide key={brand.id}>
                <Box className={"review-box"} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <img
                    src={brand.img}
                    alt={brand.alt}
                    // style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Container>
      </div>

      {/* ADDRESS SECTION */}
      <div className={"address"}>
        <Container>
          <Stack className={"address-area"}>
            <Box className={"title"}>{t("Our address")}</Box>
            <iframe
              style={{ marginTop: "60px" }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24556900.879609067!2d30.212402343749986!3d41.2943172631526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a9323b4aa5cb98!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2skr!4v1788008739833!5m2!1sen!2skr"
              width="1320"
              height="500"
              referrerPolicy="no-referrer-when-downgrade"
              title={t("address-map")}
            ></iframe>
          </Stack>
        </Container>
      </div>
    </div>
  );
}