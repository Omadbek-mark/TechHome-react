import { useI18n } from '../../../lib/i18n';
import { Box, Container, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Footers = styled.div`
  width: 100%;
  height: 590px;
  display: flex;
  background: #343434;
  background-size: cover;
`;

export default function Footer() {
  const { t } = useI18n();
  const authMember = null;

  return (
    <Footers className="footer">
      <Container>
        <Stack flexDirection={"row"} sx={{ mt: "94px" }}>
          <Stack flexDirection={"column"} style={{ width: "340px" }}>
            <Box>
              <img width={"300px"} src={"/icons/TechHome.svg"}  alt="" />
            </Box>
            <Box className={"foot-desc-txt"}>{t("Explore the catalog and compare available product specifications. Orders and payment confirmation are demonstrations.")}</Box>
            <Box>{t("Andijan · Tashkent · Samarkand")}</Box>
            <Box className="sns-context">
              <img src={"/icons/facebook.svg"}  alt="" />
              <img src={"/icons/twitter.svg"}  alt="" />
              <img src={"/icons/instagram.svg"}  alt="" />
              <img src={"/icons/youtube.svg"}  alt="" />
            </Box>
          </Stack>
          <Stack sx={{ ml: "288px" }} flexDirection={"row"}>
            <Stack>
              <Box>
                <Box className={"foot-category-title"}>{t("Sections")}</Box>
                <Box className={"foot-category-link"}>
                  <Link to="/">{t("Home")}</Link>
                  <Link to="/products">{t("Products")}</Link>
                  {authMember && <Link to="/orders">{t("Orders")}</Link>}
                  <Link to="/help">{t("Help")}</Link>
                </Box>
              </Box>
            </Stack>
            <Stack sx={{ ml: "100px" }}>
              <Box>
                <Box className={"foot-category-title"}>{t("Find us")}</Box>
                <Box
                  flexDirection={"column"}
                  sx={{ mt: "20px" }}
                  className={"foot-category-link"}
                  justifyContent={"space-between"}
                >
                  <Box flexDirection={"row"} className={"find-us"}>
                    <span>{t("L.")}</span>
                    <div>{t("Tashkent City, Tashkent")}</div>
                  </Box>
                  <Box className={"find-us"}>
                    <span>{t("P.")}</span>
                    <div>+998 33 707 00 29</div>
                  </Box>
                  <Box className={"find-us"}>
                    <span>{t("E.")}</span>
                    <div>{t("techHomeuz@gmail.com")}</div>
                  </Box>
                  <Box className={"find-us"}>
                    <span>{t("H.")}</span>
                    <div>{t("Mon–Sun · 9:00–20:00")}</div>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          style={{ border: "1px solid #C5C8C9", width: "100%", opacity: "0.2" }}
          sx={{ mt: "80px" }}
        ></Stack>
        <Stack className={"copyright-txt"}>{t("© Copyright Devex Global, All rights reserved.")}</Stack>
      </Container>
    </Footers>
  );
}
