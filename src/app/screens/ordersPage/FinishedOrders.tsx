import { useI18n } from '../../../lib/i18n';
import { Stack } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import { useSelector } from 'react-redux';
import { retrieveFinishedOrders } from './selector';
import OrderCard from './OrderCard';

export default function FinishedOrders() {
  const { t } = useI18n();
  const orders = useSelector(retrieveFinishedOrders);
  return <TabPanel value="3"><Stack>
    {orders.map(order => <OrderCard key={order._id} order={order}></OrderCard>)}
    {!orders.length && <p>{t("No orders in this section.")}</p>}
  </Stack></TabPanel>;
}
