import { useI18n } from '../../../lib/i18n';
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ProductTile from "../../components/ProductTile";
import { Product } from "../../../lib/types/product";

export default function Deals({ products }: { products: Product[] }) {
  const { t } = useI18n();
  return (
    <Box component="section" className="th-section">
      <Box className="th-container">
        <Box className="th-eyebrow" sx={{ color: "var(--amber)" }}>
          <Box component="span" className="th-dot th-dot--amber" />{t("LIMITED WINDOW")}</Box>
        <Typography component="h2" className="th-heading th-section__title">{t("This week's deals")}</Typography>
        {products.length === 0 ? (
          <Box className="th-empty-state">{t("No deals right now — check back soon.")}</Box>
        ) : (
          <Box className="th-grid">
            {products.map((p) => {
              const percent = p.productOldPrice
                ? Math.round(((p.productOldPrice - p.productPrice) / p.productOldPrice) * 100)
                : undefined;
              return <ProductTile key={p._id} product={p} discountPercent={percent} />;
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
