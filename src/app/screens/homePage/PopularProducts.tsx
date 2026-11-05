import { useI18n } from '../../../lib/i18n';
import Typography from "@mui/material/Typography";
import ProductTile from "../../components/ProductTile";
import { Product } from "../../../lib/types/product";
import { Box } from "@mui/material";

export default function PopularProducts({ products }: { products: Product[] }) {
  const { t } = useI18n();

  return (
    <Box component="section" className="th-section">
      <Box className="th-container">
        <Box className="th-eyebrow">
          <Box component="span" className="th-dot th-dot--forest" />{t("MOST VIEWED")}</Box>
        <Typography component="h2" className="th-heading th-section__title">{t("Popular this month")}</Typography>
        {products.length === 0 ? (
          <Box className="th-empty-state">{t("Popular products are not available.")}</Box>
        ) : (
          <Box className="th-grid">
            {products.map((p) => (
              <ProductTile key={p._id} product={p} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
