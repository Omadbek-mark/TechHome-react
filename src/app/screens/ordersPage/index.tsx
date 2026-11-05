import { errorMessage, useI18n } from '../../../lib/i18n';
import { useLocation } from "react-router-dom";
import { useState, SyntheticEvent, useEffect } from "react";
import { Alert, Container, Stack, Box } from "@mui/material";
import { Button } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PausedOrders from "./PausedOrders";
import ProcessOrders from "./ProcessOrders";
import FinishedOrders from "./FinishedOrders";
import { useDispatch } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { Order, OrderInquiry } from "../../../lib/types/order";
import { setFinishedOrders, setPausedOrders, setProcessOrders } from "./slice";
import { OrderStatus } from "../../../lib/enums/order.enum";
import OrderService from "../../services/OrderService";
import { useGlobals } from "../../hooks/useGlobals";
import "../../../css/order.css";
import { serverApi } from "../../../lib/config";
import { MemberType } from "../../../lib/enums/member.enum";

/** REDUX SLICE & SELECTOR **/
const actionDispatch = (dispatch: Dispatch) => ({
  setPausedOrders: (data: Order[]) => dispatch(setPausedOrders(data)),
  setProcessOrders: (data: Order[]) => dispatch(setProcessOrders(data)),
  setFinishedOrders: (data: Order[]) => dispatch(setFinishedOrders(data)),
});

export default function OrdersPage() {
  const { t } = useI18n();
  const { setPausedOrders, setProcessOrders, setFinishedOrders } = actionDispatch(useDispatch());
  const { orderBuilder, authMember } = useGlobals();
  const location = useLocation<{ checkoutTotal?: number }>();
  const [value, setValue] = useState("1");
  const [orderInquiry, setOrderInquiry] = useState<OrderInquiry>({
    page: 1,
    limit: 5,
    orderStatus: OrderStatus.PAUSE,
  });

  const [loading, setLoading] = useState(true), [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<unknown>(null), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!authMember) return;
    let active = true; setLoading(true); setError(null);
    const service = new OrderService();
    Promise.all([OrderStatus.PAUSE, OrderStatus.PROCESS, OrderStatus.FINISH].map(orderStatus => service.getMyOrders({ ...orderInquiry, orderStatus }))).then(([paused, process, finished]) => {
      if (!active) return;
      setPausedOrders(paused); setProcessOrders(process); setFinishedOrders(finished); setLoaded(true);
    }).catch(err => { if (active) setError(err); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderInquiry, orderBuilder, authMember?._id, attempt]);

  /** HANDLERS **/

  const handleChange = (e: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  if (!authMember) return null;
  return (
    <div className={"order-page"}>
      <Container className="order-container">
        <Stack className={"order-left"}>
          <h1>{t("Orders")}</h1>
          <Alert severity="info">{t("Demo payment: no money is charged. Do not enter card details.")}</Alert>
          {typeof location.state?.checkoutTotal === "number" && <Alert severity="success">{t("Order placed. Server total: $")}{location.state.checkoutTotal.toFixed(2)}</Alert>}
          {loading && <p role="status">{t("Loading orders…")}</p>}
          {error !== null && <Alert severity="error">{errorMessage(error)}<Button onClick={() => setAttempt(value => value + 1)}>{t("Retry orders")}</Button></Alert>}
          <TabContext value={value}>
            <Box className={"order-nav-frame"}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label={t("Order sections")}
                  className={"table_list"} variant="scrollable" scrollButtons="auto"
                >
                  <Tab label={t("PAUSED ORDERS")} value={"1"} />
                  <Tab label={t("PROCESS ORDERS")} value={"2"} />
                  <Tab label={t("FINISHED ORDERS")} value={"3"} />
                </Tabs>
              </Box>
            </Box>
            {loaded && <Stack className={"order-main-content"}>
              <PausedOrders setValue={setValue} />
              <ProcessOrders setValue={setValue} />
              <FinishedOrders />
            </Stack>}
          </TabContext>
        </Stack>

        <Stack className={"order-right"}>
          <Box className={"order-info-box"}>
            <Box className={"member-box"}>
              <div className={"order-user-img"}>
                <img
                  src={
                    authMember?.memberImage
                      ? `${serverApi}/${authMember.memberImage}`
                      : "/icons/default-user.png"
                  }
                  className={"order-user-avatar"} alt={t("Profile image")} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/icons/default-user.png"; }}
                />
                <div className={"order-user-icon-box"}>
                  <img
                    src={authMember?.memberType === MemberType.STORE
                      ? "/icons/restaurant.svg"
                      : "/icons/user-badge.svg"}
                    className={"order-user-prof-img"}
                   alt="" />
                </div>
              </div>
              <span className={"order-user-name"}>{authMember?.memberNick}</span>
              <span className={"order-user-prof"}>{t(authMember?.memberType === MemberType.STORE ? "Store" : "Customer")}</span>
            </Box>
            <Box className={"liner"}></Box>
            <Box className={"order-user-address"}>
              <div style={{ display: "flex" }}>
                <LocationOnIcon />
              </div>
              <div className={"spec-address-txt"}>
                {authMember?.memberAddress
                  ? authMember.memberAddress
                  : t("Not provided")}
              </div>
            </Box>
          </Box>

        </Stack>
      </Container>
    </div>
  );
}
