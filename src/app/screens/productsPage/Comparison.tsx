import { useI18n } from '../../../lib/i18n';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Product } from '../../../lib/types/product';
import { visibleSpecRows, specValue } from '../../../lib/catalog/specs';
import ProductService from '../../services/ProductService';

const ComparisonContext = createContext<{ items: Product[]; toggle: (product: Product) => void }>({ items: [], toggle: () => {} });
export const useComparison = () => useContext(ComparisonContext);
export function CompareButton({ product }: { product: Product }) {
  const { t } = useI18n();
  const { items, toggle } = useComparison();
  const selected = items.some(item => item._id === product._id);
  return <Button aria-pressed={selected} aria-label={t(selected ? "Remove from comparison {{name}}" : "Compare {{name}}", { name: product.productName })} onClick={event => { event.stopPropagation(); toggle(product); }}>{selected ? t('Selected for comparison') : t('Compare')}</Button>;
}
export function ComparisonProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [items, setItems] = useState<Product[]>([]);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const toggle = (product: Product) => {
    if (items.some(item => item._id === product._id)) { setItems(items.filter(item => item._id !== product._id)); setMessage(''); return; }
    if (items.length >= 3) { setMessage('You can compare up to 3 products. Remove one to add another.'); return; }
    setItems([...items, product]); setMessage('');
  };
  return <ComparisonContext.Provider value={{ items, toggle }}>
    {children}
    {(items.length > 0 || message) && <Box className="th-container th-comparison-tray" aria-label={t("Product comparison selection")}>
      {message && <Alert severity="info">{t(message)}</Alert>}
      <p>{items.length} {t("/ 3 selected")}</p>
      {items.map(item => <Button key={item._id} onClick={() => toggle(item)} aria-label={t("Remove {{name}} from comparison", { name: item.productName })}>{item.productName} ×</Button>)}
      <Button variant="contained" disabled={!items.length} onClick={() => setOpen(true)}>{t("Compare selected")}</Button>
      <Button onClick={() => { setItems([]); setMessage(''); }}>{t("Clear comparison")}</Button>
    </Box>}
    <ComparisonDialog items={items} open={open} onClose={() => setOpen(false)} />
  </ComparisonContext.Provider>;
}
function ComparisonDialog({ items, open, onClose }: { items: Product[]; open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<(Product | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    let active = true; setLoading(true); setRows([]);
    Promise.allSettled(items.map(item => new ProductService().getProduct(item._id))).then(result => {
      if (!active) return;
      setRows(result.map(value => value.status === 'fulfilled' ? value.value : null)); setLoading(false);
    });
    return () => { active = false; };
  }, [items, open, retry]);
  return <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth aria-labelledby="comparison-title">
    <DialogTitle id="comparison-title">{t("Compare products")}</DialogTitle>
    <DialogContent>
      <p>{t("Only catalog specifications are shown. Missing details are marked “Not provided”.")}</p>
      {loading ? <p role="status">{t("Loading current products…")}</p> : <>
        {rows.some(row => row === null) && <Alert severity="warning">{t("Some products could not be loaded or are no longer available.")}<Button onClick={() => setRetry(value => value + 1)}>{t("Retry comparison")}</Button></Alert>}
        <TableContainer role="region" tabIndex={0} aria-label={t("Product comparison")}><Table size="small" aria-label={t("Product comparison")}><TableHead><TableRow><TableCell>{t("Specification")}</TableCell>{items.map(item => <TableCell key={item._id} component="th" scope="col">{rows[items.indexOf(item)]?.productName ?? item.productName}</TableCell>)}</TableRow></TableHead><TableBody>
          {[{ key: 'productPrice' as const, label: 'Current price (USD)' }, { key: 'productLeftCount' as const, label: 'Available stock' }, ...visibleSpecRows(rows.filter((row): row is Product => !!row))].map(row => <TableRow key={row.key}>
            <TableCell component="th" scope="row">{t(row.label)}</TableCell>{items.map((item, index) => <TableCell key={item._id}>{rows[index] ? specValue(rows[index]!, row.key, 'unit' in row ? row.unit : '') : t('Unavailable')}</TableCell>)}
          </TableRow>)}
        </TableBody></Table></TableContainer>
      </>}
    </DialogContent><DialogActions><Button onClick={onClose}>{t("Close comparison")}</Button></DialogActions>
  </Dialog>;
}
