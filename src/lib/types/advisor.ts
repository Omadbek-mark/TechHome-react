import { Language } from '../i18n';
export const advisorReplyCodes = ['AI_ANSWERED','AI_CLARIFY','AI_SAFETY','AI_SCOPE_ONLY'] as const;
export type AdvisorReplyCode = typeof advisorReplyCodes[number];
export interface AdvisorStatus { available: boolean; guestDaily: number; memberDaily: number; }
export interface AdvisorInput { language: Language; messages: string[]; }
export interface AdvisorResult { replyCode: AdvisorReplyCode; answer: string; products: never[]; allowance?: { remaining: number; dailyLimit: number; resetsAt: string }; }
// Keep only bounded user context. No assistant/system text or transcript persistence.
export function advisorMessages(previous: string[], next: string): string[] {
  const messages = [...previous.slice(-3), next.trim()];
  while (messages.length > 1 && messages.join('').length > 1600) messages.shift();
  return messages;
}
