import { Container } from '@mui/material';
import Navigation, { NavigationProps } from './Navigation';
export default function OtherNavbar(props: NavigationProps) {
  return <div className="other-navbar"><Container className="navbar-container"><Navigation {...props} /></Container></div>;
}
