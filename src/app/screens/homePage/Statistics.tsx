import { useI18n } from '../../../lib/i18n';
import React from "react";
import Box from "@mui/material/Box";

const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7h11v8H3z" />
    <path d="M14 9h3l3 3v3h-6z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="17.5" cy="17.5" r="1.5" />
  </svg>
);

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="m9.5 12 1.5 1.5 3.5-4" />
  </svg>
);

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5z" />
    <path d="M16 12h3.5v-4.5A2.5 2.5 0 0 0 17 5h-1.5" />
    <path d="M3 10h13" />
  </svg>
);

const trustPoints = [
  { icon: TruckIcon, label: "Catalog details", detail: "Check available specifications" },
  { icon: ShieldCheckIcon, label: "Product comparison", detail: "Compare up to three products" },
  { icon: WalletIcon, label: "Demo orders", detail: "No real payment" },
];

export default function Statistics() {
  const { t } = useI18n();
  return (
    <Box component="section" className="th-trust">
      <Box className="th-container th-trust__grid">
        {trustPoints.map((point) => (
          <Box className="th-trust__item" key={t(point.label)}>
            <point.icon width={22} height={22} strokeWidth={1.6} />
            <Box>
              <Box className="th-trust__label">{t(point.label)}</Box>
              <Box className="th-trust__detail">{t(point.detail)}</Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
