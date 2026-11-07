import { errorMessage, useI18n } from '../../../lib/i18n';
import React from "react";
import { Alert, Box, Button, Stack } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/search";
import { serverApi } from "../../../lib/config";
import { checkoutIntent, completeCheckout, quantityLimit } from "../../../lib/order/checkout";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";

interface BasketProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onDelete: (item: CartItem) => void;
  onDeleteAll: (expected?: CartItem[]) => void;
}

export default function Basket(props: BasketProps) {
  const { t } = useI18n();
  const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = props;
  const { authMember, authState, setOrderBuilder } = useGlobals();
  const history = useHistory();
  const itemsPrice: number = cartItems.reduce((a: number, c: CartItem) => a + c.quantity * c.price, 0
  );
  const shippingCost: number = itemsPrice < 100 ? 5 : 0;
  const totalPrice = (itemsPrice + shippingCost).toFixed(2);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /** HANDLERS **/

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const submitting = React.useRef(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const proceedOrderHandler = async () => {
    if (submitting.current || !cartItems.length) return;
    if (!authMember || authState !== "authenticated") { setError(new Error("Please sign in before placing an order.")); return; }
    submitting.current = true;
    setPending(true);
    setError(null);
    const snapshot = cartItems.map(item => ({ ...item }));
    try {
      const key = checkoutIntent(authMember._id, snapshot);
      const result = await new OrderService().createOrder(snapshot, key);
      completeCheckout(key);
      onDeleteAll(snapshot);
      setOrderBuilder(new Date());
      handleClose();
      history.push("/orders", { checkoutTotal: result.orderTotal });
    } catch (err: any) {
      setError(err);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  return (
    <Box className={"hover-line"}>
      <IconButton
        aria-label={t("Cart")}
        id="cart-button"
        aria-controls={open ? "cart-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Badge badgeContent={cartItems.length} color="secondary">
          <img src={"/icons/shopping-cart.svg"}  alt="" />
        </Badge>
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        id="cart-menu"
        open={open}
        onClose={handleClose}
        // onClick={handleClose}
        PaperProps={{
          role: "dialog", "aria-label": t("Cart"), "aria-modal": true, tabIndex: -1,
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Stack className={"basket-frame"}>
          <Button sx={{ alignSelf: "flex-end" }} onClick={handleClose}>{t("Close")}</Button>
          {error !== null && <Alert severity="error">{errorMessage(error)}</Alert>}
          <small>{t("Final price and availability are checked when you place the order.")}</small>
          <Box className={"all-check-box"}>
            {cartItems.length === 0 ? (
              <div>{t("Cart is empty!")}</div>
            ) : (
              <Stack flexDirection={"row"}>
                <div>{t("Cart Products:")}</div>
                <IconButton aria-label={t("Clear cart")} disabled={pending} onClick={() => onDeleteAll()}><DeleteForeverIcon color="primary" /></IconButton>
              </Stack>
            )}
          </Box>

          <Box className={"orders-main-wrapper"}>
            <Box className={"orders-wrapper"}>
              {cartItems.map((item: CartItem) => {
                const imagePath = item.image ? `${serverApi}/${item.image}` : "/icons/TechHome.svg";
                return (
                  <Box className={"basket-info-box"} key={item._id}>
                    <div className={"cancel-btn"}>
                      <IconButton aria-label={t("Remove {{name}}", { name: item.name })} disabled={pending} onClick={() => onDelete(item)}><CancelIcon color="primary" /></IconButton>
                    </div>
                    <img src={imagePath} alt={item.name} className={"product-img"} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/icons/TechHome.svg"; }} />
                    <div className="product-details">
                      <span className={"product-name"}>{item.name}</span>
                    <p className={"product-price"}>
                      ${item.price}{t("x")}{item.quantity}
                    </p>
                    </div>
                    <Box sx={{ minWidth: 120 }}>
                      <div className="col-2">
                        <button
                          disabled={pending} aria-label={t("Decrease {{name}}", { name: item.name })} onClick={() => onRemove(item)} className="remove"
                        >
                          -
                        </button>{" "}
                        <button disabled={pending || item.quantity >= quantityLimit(item)} aria-label={t("Increase {{name}}", { name: item.name })} onClick={() => onAdd(item)} className="add">+</button>
                      </div>
                    </Box>
                  </Box>
                );
              })}

            </Box>
          </Box>
          {cartItems.length !== 0 ? (
            <Box className={"basket-order"}>
              <span className={"price"}>{t("Estimated total: $")}{totalPrice} ({itemsPrice} + {shippingCost})
              </span>
              <Button
                disabled={pending || authState === "loading"}
                onClick={proceedOrderHandler}
                startIcon={<ShoppingCartIcon />}
                variant={"contained"}>
              {pending ? t("Placing order…") : t("Order")}
            </Button>
          </Box>
          ) : (
            ""
          )}
        </Stack>
      </Popover>
    </Box>
  );
}
