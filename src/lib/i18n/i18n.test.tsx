import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { store } from '../../app/store';
import { GlobalContext } from '../../app/hooks/useGlobals';
import App from '../../app/App';
import ProductService from '../../app/services/ProductService';
import { errorMessage, setLanguage, translate } from './index';
import messages from './messages.json';
it('has complete UZ/RU/EN translations and matching interpolation parameters', () => {
  for (const [key,entry] of Object.entries(messages)) {
    expect(entry.en, key).toBeTruthy(); expect(entry.uz, key).toBeTruthy(); expect(entry.ru, key).toBeTruthy();
    const tokens = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map(match => match[1]).sort();
    expect(tokens(entry.uz), key).toEqual(tokens(entry.en)); expect(tokens(entry.ru), key).toEqual(tokens(entry.en));
  }
});
it('translates stable errors, reacts to language changes and hides unexpected transport details', () => {
  act(() => setLanguage('uz'));
  expect(errorMessage({ response: { data: { code: 'OUT_OF_STOCK', message: 'synthetic-private-detail' } } })).toContain('zaxiradan');
  act(() => setLanguage('ru'));
  expect(errorMessage({ response: { data: { code: 'OUT_OF_STOCK' } } })).toContain('остаток');
  expect(errorMessage(new Error('synthetic-private-detail'))).not.toContain('synthetic-private-detail');
  expect(translate('{{count}} left', { count: 0 })).toContain('0');
});
it('changes language while preserving route, query and catalog filters without refetching or remounting', async () => {
  const query = '?page=2&limit=8&productCategory=KITCHEN&search=Fixture&onSale=true';
  const history = createMemoryHistory({ initialEntries: ['/products'+query] });
  const load = vi.spyOn(ProductService.prototype, 'getCatalog').mockResolvedValue({ items: [], total: 16, page: 2, limit: 8 });
  render(<Provider store={store}><GlobalContext.Provider value={{ authState: 'guest', authMember: null, beginAuthChange: vi.fn(), refreshSession: vi.fn(), setAuthMember: vi.fn(), orderBuilder: new Date(), setOrderBuilder: vi.fn() }}><Router history={history}><App /></Router></GlobalContext.Provider></Provider>);
  await screen.findByText('16 products found');
  fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'uz' } });
  expect(screen.getByRole('heading', { name: 'Barcha mahsulotlar' })).toBeInTheDocument();
  expect(screen.getByLabelText('Mahsulot qidirish')).toHaveValue('Fixture');
  expect(screen.getByPlaceholderText('Mahsulot qidirish')).toBeInTheDocument();
  expect(history.location.pathname+history.location.search).toBe('/products'+query);
  expect(document.documentElement.lang).toBe('uz'); expect(localStorage.getItem('techhome.language')).toBe('uz');
  fireEvent.change(screen.getByLabelText('Til'), { target: { value: 'ru' } });
  expect(screen.getByRole('heading', { name: 'Все товары' })).toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(1);
});

it('translates all public catalog labels, FAQ and demo terms without inventing catalog content', async () => {
  const { specRows } = await import('../catalog/specs');
  const { terms } = await import('../data/terms'); const { faq } = await import('../data/faq');
  const keys = [...specRows.map(row => row.label), ...terms.flatMap(row => [row.title,row.body]), ...faq.flatMap(row => [row.question,row.answer])];
  for (const key of keys) expect(Object.hasOwn(messages, key), key).toBe(true);
  expect(translate('Synthetic model name')).toBe('Synthetic model name');
});
