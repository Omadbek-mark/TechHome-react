import { Alert, Box, Button } from '@mui/material';
import { useGlobals } from '../../hooks/useGlobals';
import { useEffect, useRef, useState } from 'react';
import { MemberUpdateInput } from '../../../lib/types/member';
import { serverApi } from '../../../lib/config';
import { errorMessage, useI18n } from '../../../lib/i18n';
import MemberService from '../../services/MemberService';
export function Settings() {
  const { t } = useI18n(); const { authMember, setAuthMember } = useGlobals();
  const saving = useRef(false); const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null), [saved, setSaved] = useState(false);
  const [input, setInput] = useState<MemberUpdateInput>({ memberNick: authMember?.memberNick ?? '', memberPhone: authMember?.memberPhone ?? '', memberAddress: authMember?.memberAddress ?? '', memberDesc: authMember?.memberDesc ?? '' });
  const [file, setFile] = useState<File>();
  const defaultImage = authMember?.memberImage ? `${serverApi}/${authMember.memberImage}` : '/icons/default-user.png';
  const [image, setImage] = useState(defaultImage);
  useEffect(() => { if (!file) { setImage(defaultImage); return; } const url = URL.createObjectURL(file); setImage(url); return () => URL.revokeObjectURL(url); }, [file, defaultImage]);
  const update = (key: keyof MemberUpdateInput, value: string) => { setInput(current => ({ ...current, [key]: value })); setSaved(false); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (saving.current || !authMember) return;
    saving.current = true; setPending(true); setError(null); setSaved(false);
    try { const member = await new MemberService().updateMember(input, file); setAuthMember(member); setFile(undefined); setSaved(true); }
    catch (err) { setError(err); } finally { saving.current = false; setPending(false); }
  };
  return <Box component="form" className="settings" onSubmit={submit}>
    {error !== null && <Alert severity="error">{errorMessage(error)}</Alert>}
    {saved && <Alert severity="success">{t('Profile saved.')}</Alert>}
    <Box className="member-media-frame">
      <img src={image} alt={t('Profile image')} className="mb-image" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/icons/default-user.png'; }} />
      <div className="media-change-box"><label htmlFor="profile-image">{t('Upload image')}</label><p>{t('JPEG or PNG, up to 5 MB.')}</p>
        <input id="profile-image" type="file" accept="image/jpeg,image/png" disabled={pending} onChange={event => {
          const selected = event.target.files?.[0]; if (!selected) return;
          if (!['image/jpeg','image/png'].includes(selected.type)) { setError({ code: 'INVALID_IMAGE' }); event.target.value = ''; return; }
          if (selected.size > 5 * 1024 * 1024) { setError({ code: 'UPLOAD_LIMIT' }); event.target.value = ''; return; }
          setFile(selected); setError(null); setSaved(false);
        }} />
      </div>
    </Box>
    <Box className="input-frame"><div className="long-input"><label htmlFor="profile-nick" className="spec-label">{t('Username')}</label><input id="profile-nick" name="memberNick" className="spec-input mb-nick" required minLength={3} maxLength={40} disabled={pending} autoComplete="username" value={input.memberNick} onChange={event => update('memberNick', event.target.value)} /></div></Box>
    <Box className="input-frame">
      <div className="short-input"><label htmlFor="profile-phone" className="spec-label">{t('Phone')}</label><input id="profile-phone" type="tel" name="memberPhone" className="spec-input mb-phone" required maxLength={24} disabled={pending} autoComplete="tel" value={input.memberPhone} onChange={event => update('memberPhone', event.target.value)} /></div>
      <div className="short-input"><label htmlFor="profile-address" className="spec-label">{t('Address')}</label><input id="profile-address" name="memberAddress" className="spec-input mb-address" maxLength={300} disabled={pending} autoComplete="street-address" value={input.memberAddress} onChange={event => update('memberAddress', event.target.value)} /></div>
    </Box>
    <Box className="input-frame"><div className="long-input"><label htmlFor="profile-description" className="spec-label">{t('Description')}</label><textarea id="profile-description" name="memberDesc" className="spec-textarea mb-description" maxLength={1000} disabled={pending} value={input.memberDesc} onChange={event => update('memberDesc', event.target.value)} /></div></Box>
    <Box className="save-box"><Button type="submit" variant="contained" disabled={pending}>{t(pending ? 'Saving…' : 'Save')}</Button></Box>
  </Box>;
}
