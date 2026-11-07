import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import '../../../css/auth.css';
import MemberService from '../../services/MemberService';
import { useGlobals } from '../../hooks/useGlobals';
import { errorMessage, useI18n } from '../../../lib/i18n';
interface AuthenticationModalProps { signupOpen: boolean; loginOpen: boolean; handleSignupClose: () => void; handleLoginClose: () => void; handleSignupOpen: () => void; handleLoginOpen: () => void; }
export default function AuthenticationModal(props: AuthenticationModalProps) {
  const { t } = useI18n(); const signup = props.signupOpen, open = signup || props.loginOpen;
  const close = signup ? props.handleSignupClose : props.handleLoginClose;
  const { setAuthMember, beginAuthChange } = useGlobals();
  const [nick, setNick] = useState(''), [phone, setPhone] = useState(''), [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null), [pending, setPending] = useState(false);
  const submitting = useRef(false);
  useEffect(() => { setPassword(''); setError(null); }, [open, signup]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (submitting.current) return;
    submitting.current = true; setPending(true); setError(null);
    try {
      beginAuthChange(); const service = new MemberService();
      const member = signup ? await service.signup({ memberNick: nick, memberPhone: phone, memberPassword: password }) : await service.login({ memberNick: nick, memberPassword: password });
      setAuthMember(member); close();
    } catch (err) { setAuthMember(null); setError(err); }
    finally { submitting.current = false; setPending(false); }
  };
  return <Dialog open={open} onClose={pending ? undefined : close} maxWidth={false} PaperProps={{ className: `auth-dialog${signup ? ' auth-dialog--signup' : ''}` }} aria-labelledby="auth-title">
    <div className="auth-layout">
    <img className="auth-image" src="/img/auth1.webp" alt="" />
    <form className="auth-form" onSubmit={submit}>
      <DialogTitle id="auth-title">{t(signup ? 'Signup Form' : 'Login Form')}</DialogTitle>
      <DialogContent className="auth-fields">
        {error !== null && <Alert severity="error">{errorMessage(error)}</Alert>}
        <TextField autoFocus required fullWidth disabled={pending} label={t('username')} value={nick} onChange={event => setNick(event.target.value)} autoComplete="username" inputProps={{ minLength: signup ? 3 : 1, maxLength: signup ? 40 : 256 }} />
        {signup && <TextField required fullWidth disabled={pending} label={t('phone number')} type="tel" value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" inputProps={{ maxLength: 24 }} />}
        <TextField required fullWidth disabled={pending} label={t('password')} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} inputProps={{ minLength: signup ? 8 : 1, maxLength: 72 }} />
        <Button type="button" disabled={pending} onClick={signup ? props.handleLoginOpen : props.handleSignupOpen}>{t(signup ? 'Login' : 'Sign up')}</Button>
      </DialogContent><DialogActions><Button disabled={pending} onClick={close}>{t('Close')}</Button><Button className="auth-submit" disabled={pending} type="submit" variant="contained" startIcon={<LoginIcon />}>{t(pending ? 'Please wait…' : signup ? 'Sign up' : 'Login')}</Button></DialogActions>
    </form>
    </div>
  </Dialog>;
}
