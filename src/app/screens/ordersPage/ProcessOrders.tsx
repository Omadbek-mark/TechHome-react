import { errorMessage, useI18n } from '../../../lib/i18n';
import { Alert, Button, Stack } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import { useSelector } from 'react-redux';
import { retrieveProcessOrders } from './selector';
import OrderCard from './OrderCard';
import useOrderAction from '../../hooks/useOrderAction';
import { OrderStatus } from '../../../lib/enums/order.enum';

export default function ProcessOrders({ setValue }: { setValue: (value: string) => void }) {
  const { t } = useI18n();
  const orders = useSelector(retrieveProcessOrders);
  const { update, pending, error } = useOrderAction(setValue);
  return <TabPanel value="2"><Stack>
    {error !== null && <Alert severity="error">{errorMessage(error)}</Alert>}
    {orders.map(order => <OrderCard key={order._id} order={order}>{order.readOnly === false && order.paymentMode === 'DEMO' && <Button className="verify-button" disabled={pending.includes(order._id)} onClick={() => update(order._id, OrderStatus.FINISH)}>{t("Mark received")}</Button>}</OrderCard>)}
    {!orders.length && <p>{t("No orders in this section.")}</p>}
  </Stack></TabPanel>;
}
