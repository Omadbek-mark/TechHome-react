import { useI18n } from '../../lib/i18n';
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Product } from "../../lib/types/product";

const LOW_STOCK_THRESHOLD = 5;

import { productImage, hasDiscount } from "../../lib/catalog/specs";

interface ProductTileProps {
  product: Product;
  dark?: boolean;
  discountPercent?: number;
  showBadges?: boolean;
}

export default function ProductTile({ product, dark = false, discountPercent, showBadges = false }: ProductTileProps) {
  const { t } = useI18n();
  const inStock = product.productLeftCount > LOW_STOCK_THRESHOLD;

  const installmentMonthly = product.installmentMonthly;

  return (
    <Box
      component={Link}
      to={`/products/${product._id}`}
      className={`th-card th-product-tile ${dark ? "th-product-tile--dark" : ""}`}
    >
      <Box className={`th-product-tile__media ${dark ? "th-product-tile__media--dark" : ""}`}>
        <Box
          component="img"
          src={productImage(product.productImages?.[0])}
          alt={product.productName}
          loading="lazy"
          onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/icons/TechHome.svg"; }}
          sx={{ width: "100%", height: "100%", objectFit: product.productImages[0] ? "cover" : "contain", display: "block" }}
        />
        {typeof discountPercent === "number" ? (
          <Box component="span" className="th-stock-pip th-stock-pip--low">-{discountPercent}%</Box>
        ) : (
          <Box component="span" className={`th-stock-pip ${inStock ? "" : "th-stock-pip--low"}`}>
            {inStock ? t("In stock") : t("{{count}} left", { count: product.productLeftCount })}
          </Box>
        )}
      </Box>
      <Box className="th-product-tile__body">
        <Typography component="span" className="th-product-tile__cat">
          {t(product.productCategory)}
          {!showBadges && product.energyClass ? ` · ${product.energyClass}` : ""}
        </Typography>
        <Typography component="span" className="th-product-tile__name">{product.productName}</Typography>

        {showBadges && (
          <Box className="th-badge-row">
            {product.energyClass && <Box component="span" className="th-badge th-badge--neutral">{product.energyClass}</Box>}
            {typeof product.warrantyYears === "number" && (
              <Box component="span" className="th-badge th-badge--amber">
                {product.warrantyYears === 0 ? t("No warranty") : t("{{count}}yr warranty", { count: product.warrantyYears })}
              </Box>
            )}
          </Box>
        )}

        <Box className="th-product-tile__foot">
          <Typography component="span" className="th-product-tile__price">
            ${product.productPrice}
            {hasDiscount(product) && <small>{t("was $")}{product.productOldPrice}</small>}
          </Typography>
          {product.installmentMonths > 0 && typeof installmentMonthly === "number" && (
            <Box component="span" className="th-badge th-badge--neutral">
              {product.installmentMonths}{t("mo · $")}{installmentMonthly}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}