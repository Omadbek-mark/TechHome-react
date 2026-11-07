import { expect, it, vi } from 'vitest';
import axios from 'axios';
import { api } from '../../lib/api/client';
import AdvisorService, { checkedAdvice } from './AdvisorService';
import { advisorMessages, AdvisorResult } from '../../lib/types/advisor';

const result = (): AdvisorResult => ({ replyCode: 'AI_ANSWERED', answer: 'Check the manual and clean accessible parts with power disconnected when safe.', products: [], allowance: { remaining: 9, dailyLimit: 10, resetsAt: '2026-11-02T00:00:00Z' } });
it('accepts bounded guidance and rejects malformed answers, HTML, links and unexpected product results', () => {
  expect(checkedAdvice(result()).answer).toContain('Check the manual');
  for (const change of [{answer:''},{answer:'x'.repeat(3001)},{answer:'<script>bad()</script>'},{answer:'https://invented.invalid'},{replyCode:'AI_MATCHED'},{products:[{productName:'invented'}]}]) {
    expect(() => checkedAdvice(Object.assign(result(),change))).toThrow();
  }
  expect(() => checkedAdvice({ ...result(), allowance: { remaining: 11, dailyLimit: 10, resetsAt: 'invalid' } })).toThrow();
});
it('uses cookie/CSRF transport for a single attempt and forwards only bounded user context', async () => {
  const request = vi.spyOn(api, 'post').mockResolvedValue({ data: result() });
  const signal = new AbortController().signal;
  const input = { language: 'uz' as const, messages: advisorMessages(['muzlatgich kerak'], '500 USD') };
  await new AdvisorService().ask(input, signal);
  expect(request).toHaveBeenCalledExactlyOnceWith('/ai/advisor', input, { signal, timeout: 45000 });
  request.mockRejectedValueOnce(new Error('offline'));
  await expect(new AdvisorService().ask(input)).rejects.toThrow('offline');
  expect(request).toHaveBeenCalledTimes(2);
});
it('keeps at most four user utterances within the server context budget', () => {
  expect(advisorMessages(['old','one','two','three'], ' next ')).toEqual(['one','two','three','next']);
  const values = advisorMessages(Array(3).fill('a'.repeat(600)), 'b'.repeat(600));
  expect(values.join('').length).toBeLessThanOrEqual(1600);
  expect(values.at(-1)).toBe('b'.repeat(600));
});
it('checks public configuration without a token and rejects malformed status', async () => {
  const get = vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: { available: false, guestDaily: 10, memberDaily: 30 } }).mockResolvedValueOnce({ data: { available: true, guestDaily: -1 } });
  expect((await new AdvisorService().status()).available).toBe(false);
  expect(get.mock.calls[0][0]).toBe('http://api.test.invalid/ai/status');
  await expect(new AdvisorService().status()).rejects.toHaveProperty('code', 'AI_RESPONSE_INVALID');
});
