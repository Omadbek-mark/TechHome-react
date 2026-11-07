import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Navigation, { NavigationProps } from './Navigation';
import { useGlobals } from '../../hooks/useGlobals';
import { useI18n } from '../../../lib/i18n';
export default function HomeNavbar(props: NavigationProps) {
  const { authMember } = useGlobals(); const { t } = useI18n();
  return <div className="home-navbar"><Container className="navbar-container">
    <Navigation {...props} />
    <Stack className="header-frame"><Stack className="detail">
      <Typography component="h1" className="head-main-txt">{t('Appliances for your everyday life.')}</Typography>
      <Box className="wel-txt">{t('Explore products, compare specifications and try demo orders.')}</Box>
      {!authMember && <Box className="signup"><Button className="signup-button" variant="contained" onClick={() => props.setSignupOpen(true)}>{t('Sign up')}</Button></Box>}
    </Stack><Box className="logo-frame"><div className="logo-img" /></Box></Stack>
  </Container></div>;
}
