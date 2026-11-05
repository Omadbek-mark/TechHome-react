import { Box, Button, Drawer, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Basket from './Basket';
import { CartItem } from '../../../lib/types/search';
import { useGlobals } from '../../hooks/useGlobals';
import { useI18n, Language } from '../../../lib/i18n';
import { serverApi } from '../../../lib/config';
export interface NavigationProps {
  cartItems: CartItem[];
  onAdd: (item: CartItem) => void; onRemove: (item: CartItem) => void; onDelete: (item: CartItem) => void;
  onDeleteAll: (expected?: CartItem[]) => void;
  setSignupOpen: (value: boolean) => void; setLoginOpen: (value: boolean) => void;
  handleLogoutClick: (event: React.MouseEvent<HTMLElement>) => void;
  anchorEl: HTMLElement | null; handleCloseLogout: () => void; handleLogoutRequest: () => void;
}
export default function Navigation(props: NavigationProps) {
  const { t, language, setLanguage } = useI18n();
  const { authMember } = useGlobals();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  const links = [['/', 'Home'], ['/products', 'Products'], ...(authMember ? [['/orders', 'Orders'], ['/member-page', 'My Page']] : []), ['/help', 'Help']];
  const navigation = <>{links.map(([path,label]) => <NavLink exact={path === '/'} key={path} to={path} activeClassName="underline">{t(label)}</NavLink>)}</>;
  return <Stack className="menu">
    <NavLink to="/" aria-label="TechHome"><img className="brand-logo" src="/icons/TechHome.svg" alt="TechHome" /></NavLink>
    <Box component="nav" className="desktop-links" aria-label={t('Main navigation')}>{navigation}</Box>
    <Stack className="links nav-controls">
      <label className="language-select"><span className="visually-hidden">{t('Language')}</span><select aria-label={t('Language')} value={language} onChange={event => setLanguage(event.target.value as Language)}><option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option></select></label>
      <Basket cartItems={props.cartItems} onAdd={props.onAdd} onRemove={props.onRemove} onDelete={props.onDelete} onDeleteAll={props.onDeleteAll} />
      {!authMember ? <Button className="login-button" variant="contained" onClick={() => props.setLoginOpen(true)}>{t('Login')}</Button> : <IconButton aria-label={t('Account menu')} aria-haspopup="menu" aria-expanded={Boolean(props.anchorEl)} onClick={props.handleLogoutClick}><img className="user-avatar" src={authMember.memberImage ? `${serverApi}/${authMember.memberImage}` : '/icons/default-user.png'} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/icons/default-user.png'; }} /></IconButton>}
      <IconButton className="mobile-menu-button" aria-label={t('Open navigation')} aria-expanded={open} aria-controls={open ? 'mobile-navigation' : undefined} onClick={() => setOpen(true)}><MenuIcon /></IconButton>
    </Stack>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ className: 'mobile-navigation' }}>
      <IconButton aria-label={t('Close navigation')} onClick={() => setOpen(false)}><CloseIcon /></IconButton>
      <nav id="mobile-navigation" aria-label={t('Main navigation')}>{navigation}</nav>
    </Drawer>
    <Menu anchorEl={props.anchorEl} open={Boolean(props.anchorEl)} onClose={props.handleCloseLogout}><MenuItem onClick={() => { props.handleCloseLogout(); props.handleLogoutRequest(); }}>{t('Logout')}</MenuItem></Menu>
  </Stack>;
}
