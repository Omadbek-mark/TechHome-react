import { useI18n } from '../../../lib/i18n';
import { Box, Container, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Settings } from "./Settings";
import { useGlobals } from "../../hooks/useGlobals";
import { serverApi } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";
import "../../../css/userPage.css";

export default function UserPage() {
  const { t } = useI18n();
  const { authMember } = useGlobals();

  if (!authMember) return null;
  return (
    <div className={"user-page"}>
      <Container>
        <Stack className={"my-page-frame"}>
          <Stack className={"my-page-left"}>
            <Box display={"flex"} flexDirection={"column"}>
              <Box component="h1" className={"menu-name"}>{t("Modify Member Details")}</Box>
              <Box className={"menu-content"}>
                <Settings />
              </Box>
            </Box>
          </Stack>

          <Stack className={"my-page-right"}>
            <Box className={"order-info-box"}>
              <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <div className={"order-user-img"}>
                  <img
                    src={authMember?.memberImage
                      ? `${serverApi}/${authMember.memberImage}`
                      : "/icons/default-user.png"
                    }
                    className={"order-user-avatar"} alt={t("Profile image")} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/icons/default-user.png"; }}
                  />
                  <div className={"order-user-icon-box"}>
                    <img src={authMember?.memberType === MemberType.STORE
                      ? "/icons/restaurant.svg"
                      : "/icons/user-badge.svg"}  alt="" />
                  </div>
                </div>
                <span className={"order-user-name"}>{authMember?.memberNick}</span>
                <span className={"order-user-prof"}>{t(authMember?.memberType === MemberType.STORE ? "Store" : "Customer")}</span>
                <span className={"order-user-prof"}>
                  {authMember?.memberAddress
                    ? authMember.memberAddress
                    : t("Not provided")}
                </span>
              </Box>
              <Box className={"user-media-box"}>
                <FacebookIcon />
                <InstagramIcon />
                <TelegramIcon />
                <YouTubeIcon />
              </Box>
              <p className={"user-desc"}>{authMember?.memberDesc
                ? authMember.memberDesc
                : t("Not provided")}
              </p>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
