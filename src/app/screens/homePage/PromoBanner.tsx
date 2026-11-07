import { useI18n } from '../../../lib/i18n';
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowRight from "@mui/icons-material/ArrowRight";

export default function PromoBanner() {
  const { t } = useI18n();
  return (
    <Box component="section" className="th-promo">
      <Box className="th-container th-promo__inner">
        <Box>
          <Box className="th-eyebrow" sx={{ color: "var(--amber)" }}>
            <Box component="span" className="th-dot th-dot--amber" />{t("COMPARE")}</Box>
          <Typography component="h2" className="th-heading th-promo__title">{t("Find a product that fits your needs")}</Typography>
          <Typography component="p" className="th-promo__lede">{t("Compare up to three products using the specifications available in the catalog.")}</Typography>
        </Box>
        <Button component={Link} to="/products" className="th-btn th-btn--amber">{t("Explore products")}<ArrowRight fontSize="small" />
        </Button>
      </Box>
    </Box>
  );
}
