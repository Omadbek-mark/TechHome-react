import axios from 'axios';
import { api } from '../../lib/api/client';
import { serverApi } from '../../lib/config';
import { AdvisorInput, AdvisorResult, AdvisorStatus, advisorReplyCodes } from '../../lib/types/advisor';
const invalid = () => Object.assign(new Error('Advisor response could not be used.'), { code: 'AI_RESPONSE_INVALID' });
export function checkedAdvice(data: AdvisorResult): AdvisorResult {
  if (!data || !advisorReplyCodes.includes(data.replyCode) || typeof data.answer !== 'string' || data.answer.trim().length < 2 || data.answer.length > 3000 ||
      /<\/?[a-z][^>]*>|https?:\/\//iu.test(data.answer) || !Array.isArray(data.products) || data.products.length !== 0) throw invalid();
  if (data.allowance && (!Number.isSafeInteger(data.allowance.remaining) || !Number.isSafeInteger(data.allowance.dailyLimit) || data.allowance.remaining < 0 || data.allowance.dailyLimit < 1 || data.allowance.remaining > data.allowance.dailyLimit || !Number.isFinite(Date.parse(data.allowance.resetsAt)))) throw invalid();
  return data;
}
export default class AdvisorService {
  public async status(signal?: AbortSignal): Promise<AdvisorStatus> {
    const { data } = await axios.get<AdvisorStatus>(`${serverApi}/ai/status`, { signal });
    if (typeof data?.available !== 'boolean' || !Number.isSafeInteger(data.guestDaily) || data.guestDaily < 1 || !Number.isSafeInteger(data.memberDaily) || data.memberDaily < 1) throw invalid();
    return data;
  }
  public async ask(input: AdvisorInput, signal?: AbortSignal): Promise<AdvisorResult> {
    return checkedAdvice((await api.post<AdvisorResult>('/ai/advisor', input, { signal, timeout: 45000 })).data);
  }
}
