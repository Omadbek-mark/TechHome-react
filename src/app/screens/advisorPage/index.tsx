import { FormEvent, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useI18n, errorMessage } from '../../../lib/i18n';
import { AdvisorResult, AdvisorStatus, AdvisorReplyCode, advisorMessages } from '../../../lib/types/advisor';
import AdvisorService from '../../services/AdvisorService';
import { useGlobals } from '../../hooks/useGlobals';

export default function AdvisorPage() {
  const { t, language } = useI18n(); const { authMember, authState, refreshSession } = useGlobals();
  const [status, setStatus] = useState<AdvisorStatus | null>(null), [statusError, setStatusError] = useState<unknown>(null), [retryStatus, setRetryStatus] = useState(0);
  const [question, setQuestion] = useState(''), [pending, setPending] = useState(false), [error, setError] = useState<unknown>(null);
  const [turns, setTurns] = useState<{ user: string; replyCode: AdvisorReplyCode; answer: string }[]>([]), [result, setResult] = useState<AdvisorResult | null>(null);
  const generation = useRef(0), submitting = useRef(false), request = useRef<AbortController>(), identity = useRef(authMember?._id);
  useEffect(() => {
    let active = true; const controller = new AbortController(); setStatus(null); setStatusError(null);
    new AdvisorService().status(controller.signal).then(value => { if (active) setStatus(value); }).catch(err => { if (active && !axios.isCancel(err)) setStatusError(err); });
    return () => { active = false; controller.abort(); };
  }, [retryStatus]);
  const reset = () => {
    generation.current++; request.current?.abort(); submitting.current = false;
    setQuestion(''); setTurns([]); setResult(null); setError(null); setPending(false);
  };
  useEffect(() => { if (identity.current !== authMember?._id) { identity.current = authMember?._id; reset(); } }, [authMember?._id]);
  useEffect(() => () => { generation.current++; request.current?.abort(); }, []);
  const ask = async (event: FormEvent) => {
    event.preventDefault(); const message = question.trim();
    if (submitting.current || !status?.available || message.length < 2 || message.length > 600 || ['loading','error'].includes(authState)) return;
    submitting.current = true; setPending(true); setError(null); setResult(null);
    const current = ++generation.current; const controller = new AbortController(); request.current = controller;
    try {
      const data = await new AdvisorService().ask({ language, messages: advisorMessages(turns.map(turn => turn.user), message) }, controller.signal);
      if (current !== generation.current || controller.signal.aborted) return;
      setResult(data); setTurns(previous => [...previous, { user: message, replyCode: data.replyCode, answer: data.answer }].slice(-4)); setQuestion('');
    } catch (err) { if (current === generation.current && !controller.signal.aborted && !axios.isCancel(err)) setError(err); }
    finally { if (current === generation.current) { submitting.current = false; setPending(false); } }
  };
  return <main className="advisor-page th-container">
    <header className="advisor-header"><span className="th-eyebrow">TechHome Product Assistant</span><h1>{t('Get to know your appliances')}</h1><p>{t('Practical help with everyday use, care and choosing the right appliance for your home.')}</p></header>
    <Alert severity="info">{t('AI-powered guidance can be mistaken. Check your appliance manual for model-specific instructions. Do not share personal data, passwords or card details.')}</Alert>
    {!status && !statusError && <p role="status">{t('Checking advisor availability…')}</p>}
    {statusError !== null && <Alert severity="error">{errorMessage(statusError)}<Button onClick={() => setRetryStatus(value => value + 1)}>{t('Retry advisor status')}</Button></Alert>}
    {status && !status.available && <Alert severity="warning">{t('The assistant is currently unavailable. Please try again later or browse the catalog.')}</Alert>}
    {authState === 'error' && <Alert severity="warning">{t('Unable to check your session. Please try again.')}<Button onClick={() => void refreshSession()}>{t('Retry')}</Button></Alert>}
    {status && <p className="advisor-limit">{t('Daily limit: {{guest}} questions for guests, {{member}} when signed in.', { guest: status.guestDaily, member: status.memberDaily })}</p>}
    {turns.length > 0 && <section className="advisor-conversation" aria-label={t('Advisor conversation')} aria-live="polite">
      {turns.map((turn,index) => <Box className="th-card advisor-turn" key={index}><p><strong>{t('Your question')}</strong>: {turn.user}</p><div className={`advisor-answer ${turn.replyCode === 'AI_SAFETY' ? 'advisor-answer-safety' : ''}`}><strong>TechHome Product Assistant</strong><p>{turn.answer}</p></div></Box>)}
    </section>}
    {!turns.length && <section className="advisor-examples" aria-label={t('Try a question')}><h2>{t('How can I help?')}</h2><div>
      {['Why does my washing machine smell?', 'How do I clean an air conditioner filter?', 'What should I consider before buying a refrigerator?'].map(example => <Button key={example} variant="outlined" disabled={pending || !status?.available} onClick={() => { setQuestion(t(example)); document.getElementById('assistant-question')?.focus(); }}>{t(example)}</Button>)}
    </div></section>}
    <Box component="form" className="advisor-form" onSubmit={ask}>
      <TextField id="assistant-question" label={t('What would you like to know?')} placeholder={t('For example: why does my washing machine smell, and how can I clean it safely?')} multiline minRows={3} fullWidth value={question} onChange={event => setQuestion(event.target.value)} inputProps={{ maxLength: 600 }} disabled={pending || !status?.available} helperText={t('{{count}} / 600 characters', { count: question.length })} />
      <div className="advisor-actions"><Button variant="contained" type="submit" disabled={pending || !status?.available || question.trim().length < 2 || ['loading','error'].includes(authState)}>{t(pending ? 'Thinking…' : 'Send question')}</Button><Button type="button" onClick={reset} disabled={!turns.length && !question && !pending}>{t('New conversation')}</Button><Button component={Link} to="/products">{t('Browse catalog')}</Button></div>
    </Box>
    {pending && <p role="status" className="advisor-pending"><CircularProgress size={20} />{t('Preparing your answer…')}</p>}
    {error !== null && <Alert severity="error">{errorMessage(error)} <Link to="/products">{t('Browse catalog')}</Link></Alert>}
    {result?.allowance && <p>{t('{{remaining}} of {{limit}} questions left today.', { remaining: result.allowance.remaining, limit: result.allowance.dailyLimit })}</p>}

  </main>;
}
