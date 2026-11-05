import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { GlobalContext } from '../../hooks/useGlobals';
import AdvisorService from '../../services/AdvisorService';
import AdvisorPage from './index';
import { ComparisonProvider } from '../productsPage/Comparison';
import { AdvisorResult } from '../../../lib/types/advisor';
import { setLanguage, translate } from '../../../lib/i18n';
import { Member } from '../../../lib/types/member';

const available = { available: true, guestDaily: 10, memberDaily: 30 };
const advice: AdvisorResult = { replyCode: 'AI_ANSWERED', answer: 'Clean the accessible filter with power disconnected when safe. Follow your appliance manual.', products: [], allowance: { remaining: 9, dailyLimit: 10, resetsAt: '2026-11-02T00:00:00Z' } };
function setup() {
  const history = createMemoryHistory({ initialEntries: ['/advisor'] });
  const view = (member: Member | null = null) => <GlobalContext.Provider value={{ authState: member ? 'authenticated' : 'guest', authMember: member, beginAuthChange: vi.fn(), refreshSession: vi.fn(), setAuthMember: vi.fn(), orderBuilder: new Date(), setOrderBuilder: vi.fn() }}><Router history={history}><ComparisonProvider><Switch><Route path="/advisor"><AdvisorPage /></Route><Route path="/products"><p>Catalog route</p></Route></Switch></ComparisonProvider></Router></GlobalContext.Provider>;
  const rendered = render(view());
  return { history, ...rendered, identity: (member: Member) => rendered.rerender(view(member)) };
}
async function ask(question = 'Why does my washing machine smell?') {
  const input = await screen.findByRole('textbox', { name: 'What would you like to know?' });
  await waitFor(() => expect(input).toBeEnabled());
  fireEvent.change(input, { target: { value: question } });
  fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
}
beforeEach(() => vi.spyOn(AdvisorService.prototype, 'status').mockResolvedValue(available));
it('lets a guest ask once and displays a real text answer instead of catalog suggestions', async () => {
  let resolve!: (value: AdvisorResult) => void;
  const request = vi.spyOn(AdvisorService.prototype, 'ask').mockImplementation(() => new Promise(done => { resolve = done; }));
  setup(); await ask();
  fireEvent.submit(screen.getByRole('textbox').closest('form')!);
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0]).toEqual({ language: 'en', messages: ['Why does my washing machine smell?'] });
  await act(async () => resolve(advice));
  expect(await screen.findByText(advice.answer)).toBeInTheDocument();
  expect(screen.queryByText('Suggested products')).not.toBeInTheDocument();
  expect(screen.getByText('9 of 10 questions left today.')).toBeInTheDocument();
  expect(document.body.textContent).not.toContain('Gemini');
  expect(localStorage.getItem('techhome.advisor')).toBeNull();
});
it('offers care and buying examples without sending a request until the user submits',async()=>{
  const request=vi.spyOn(AdvisorService.prototype,'ask').mockResolvedValue(advice);setup();
  const input=await screen.findByRole('textbox',{name:'What would you like to know?'});
  await waitFor(()=>expect(input).toBeEnabled());
  fireEvent.click(screen.getByRole('button',{name:'How do I clean an air conditioner filter?'}));
  expect(input).toHaveValue('How do I clean an air conditioner filter?');expect(input).toHaveFocus();expect(request).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Send question'}));
  expect(await screen.findByText(advice.answer)).toBeInTheDocument();
});
it('shows disabled configuration and a catalog fallback without sending a question', async () => {
  vi.mocked(AdvisorService.prototype.status).mockResolvedValue({ ...available, available: false });
  const request = vi.spyOn(AdvisorService.prototype, 'ask'); setup();
  expect(await screen.findByText(/assistant is currently unavailable/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send question' })).toBeDisabled();
  expect(screen.getByRole('link', { name: 'Browse catalog' })).toHaveAttribute('href', '/products');
  expect(request).not.toHaveBeenCalled();
});
it('keeps follow-up context and existing answers when the UI language changes', async () => {
  const followup='Which model and error code are shown?';
  const request=vi.spyOn(AdvisorService.prototype,'ask').mockResolvedValueOnce({...advice,replyCode:'AI_CLARIFY',answer:followup}).mockResolvedValueOnce({...advice,answer:'Follow the manual for this error code.'});
  setup();await ask('My washing machine stops');expect(await screen.findByText(followup)).toBeInTheDocument();
  await ask('It shows an error code');expect(await screen.findByText('Follow the manual for this error code.')).toBeInTheDocument();
  expect(request.mock.calls[1][0].messages).toEqual(['My washing machine stops','It shows an error code']);
  for(const language of ['uz','ru','en'] as const) {
    act(()=>setLanguage(language));
    expect(screen.getByRole('heading',{name:translate('Get to know your appliances',{},language)})).toBeInTheDocument();
    expect(screen.getByText(followup)).toBeInTheDocument();
  }
  expect(request).toHaveBeenCalledTimes(2);
});
it('explains daily limits and provider failures without exposing upstream text or automatic retry', async () => {
  const request = vi.spyOn(AdvisorService.prototype, 'ask').mockRejectedValueOnce({ response: { data: { code: 'AI_LIMIT_REACHED', message: 'private upstream text' } } }).mockRejectedValueOnce({ code: 'AI_TIMEOUT' });
  setup(); await ask();
  await waitFor(() => expect(screen.getByText(translate('error.AI_LIMIT_REACHED'))).toBeInTheDocument());
  expect(screen.queryByText('private upstream text')).not.toBeInTheDocument();
  await ask(); expect(await screen.findByText(translate('error.AI_TIMEOUT'))).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});
it('aborts and ignores a late answer when identity changes or the conversation is reset', async () => {
  let resolve!: (value: AdvisorResult) => void;
  const request = vi.spyOn(AdvisorService.prototype, 'ask').mockImplementation(() => new Promise(done => { resolve = done; }));
  const view = setup(); await ask();
  view.identity({ _id: 'new-member' } as Member);
  expect(request.mock.calls[0][1]?.aborted).toBe(true);
  await act(async () => resolve(advice));
  expect(screen.queryByText(advice.answer)).not.toBeInTheDocument();
  await ask(); fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
  expect(request.mock.calls[1][1]?.aborted).toBe(true);
  await act(async () => resolve(advice));
  expect(screen.queryByText(advice.answer)).not.toBeInTheDocument();
  await ask(); view.unmount(); expect(request.mock.calls[2][1]?.aborted).toBe(true);
});

it('shows safety guidance as readable plain text without enabling product or payment actions',async()=>{
  const answer='Stop using the appliance. Do not bypass the safety lock. Contact a qualified technician.';
  vi.spyOn(AdvisorService.prototype,'ask').mockResolvedValue({...advice,replyCode:'AI_SAFETY',answer});
  setup();await ask('Can I bypass the safety lock?');
  expect(await screen.findByText(answer)).toBeInTheDocument();
  expect(screen.getByText(answer).closest('.advisor-answer')).toHaveClass('advisor-answer-safety');
  expect(screen.queryByRole('button',{name:/pay|add to cart/i})).not.toBeInTheDocument();
});
