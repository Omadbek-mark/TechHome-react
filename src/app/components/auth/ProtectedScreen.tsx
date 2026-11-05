import { useI18n } from '../../../lib/i18n';
import { ReactNode } from "react";
import { Redirect } from "react-router-dom";
import { Alert, Button, CircularProgress, Box } from "@mui/material";
import { useGlobals } from "../../hooks/useGlobals";

export default function ProtectedScreen({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { authState, authMember, refreshSession } = useGlobals();
  if (authState === "loading") return <Box sx={{ p: 4 }}><CircularProgress aria-label={t("Checking session")} /></Box>;
  if (authState === "error") return <Alert severity="error" action={<Button onClick={() => void refreshSession()}>{t("Retry")}</Button>}>{t("Unable to check your session. Please try again.")}</Alert>;
  if (!authMember || authState !== "authenticated") return <Redirect to="/" />;
  return <div key={authMember._id}>{children}</div>;
}
