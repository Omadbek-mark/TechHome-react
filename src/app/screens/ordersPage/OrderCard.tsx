import { useI18n } from '../../../lib/i18n';
import { Alert, Box } from '@mui/material';
import { Order } from '../../../lib/types/order';
import { serverApi } from '../../../lib/config';
import { ReactNode } from 'react';

export default function OrderCard({ order, children }: { order: Order; children?: ReactNode }) {
  const { t, date } = useI18n();
  return <Box className="order-main-box">
    {order.readOnly !== false && <Alert severity="info">{t("Historical order — view only.")}</Alert>}
    <Box className="order-box-scroll">
      {order.orderItems?.map(item => {
        const product = order.productData?.find(value => value._id === item.productId);
        const name = item.productName || product?.productName || t('Unavailable product');
        const image = item.productImage || product?.productImages?.[0];
        return <Box key={item._id} className="orders-name-price">
          <img src={image ? `${serverApi}/${image}` : '/icons/TechHome.svg'} alt={name} className="order-dish-img"
            onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/icons/TechHome.svg'; }} />
          <p className="title-dish">{name}</p>
          <Box className="price-box"><p>${item.itemPrice.toFixed(2)} × {item.itemQuantity} = ${(item.itemPrice * item.itemQuantity).toFixed(2)}</p></Box>
        </Box>;
      })}
    </Box>
    <Box className="total-price-box">
      <Box className="box-total"><p>{t("Products: $")}{(order.orderTotal - order.orderDelivery).toFixed(2)}</p><p>{t("Delivery: $")}{order.orderDelivery.toFixed(2)}</p><p>{t("Total: $")}{order.orderTotal.toFixed(2)}</p></Box>
      <time dateTime={order.createdAt}>{date(order.createdAt)}</time>
      {children}
    </Box>
  </Box>;
}
