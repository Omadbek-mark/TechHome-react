import { errorMessage, useI18n } from '../../../lib/i18n';
import { Alert, Button, Stack } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import { useSelector } from 'react-redux';
import { retrievePausedOrders } from './selector';
import OrderCard from './OrderCard';
import useOrderAction from '../../hooks/useOrderAction';
import { OrderStatus } from '../../../lib/enums/order.enum';

export default function PausedOrders({ setValue }: { setValue: (value: string) => void }) {
  const { t } = useI18n();
  const orders = useSelector(retrievePausedOrders);
  const { update, pending, error } = useOrderAction(setValue);
  return <TabPanel value="1"><Stack>
    {error !== null && <Alert severity="error">{errorMessage(error)}</Alert>}
    {orders.map(order => <OrderCard key={order._id} order={order}>{order.readOnly === false && order.paymentMode === 'DEMO' && <>
        <Button className="cancel-button" disabled={pending.includes(order._id)} onClick={() => update(order._id, OrderStatus.DELETE)}>{t("Cancel")}</Button>
        <Button className="pay-button" disabled={pending.includes(order._id)} onClick={() => update(order._id, OrderStatus.PROCESS)}>{t("Demo confirmation")}</Button>
      </>}</OrderCard>)}
    {!orders.length && <p>{t("No orders in this section.")}</p>}
  </Stack></TabPanel>;
}
