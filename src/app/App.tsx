import { useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import HomePage from "./screens/homePage";
import AdvisorPage from "./screens/advisorPage";
import { ComparisonProvider } from "./screens/productsPage/Comparison";
import ProductsPage from "./screens/productsPage";
import OrdersPage from "./screens/ordersPage";
import UserPage from "./screens/userPage";
import HomeNavbar from "./components/headers/HomeNavbar";
import OtherNavbar from "./components/headers/OtherNavbar";
import Footer from "./components/footer";
import HelpPage from "./screens/helpPage";
import useBasket from "./hooks/useBasket";
import AuthenticationModal from "./components/auth";
import ProtectedScreen from "./components/auth/ProtectedScreen";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../lib/sweetAlert";
import { Messages } from "../lib/config";
import MemberService from "./services/MemberService";
import { useGlobals } from "./hooks/useGlobals";
import "../css/app.css";
import "../css/navbar.css";
import "../css/footer.css";
import "../css/responsive.css";
import "../css/advisor.css";

function App() {
  const location = useLocation();
  const Navbar = location.pathname === "/" ? HomeNavbar : OtherNavbar;
  const { setAuthMember, beginAuthChange } = useGlobals();
  const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = useBasket();
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  /** HANDLERS **/

  const handleSignupClose = () => setSignupOpen(false);
  const handleLoginClose = () => setLoginOpen(false);

  const handleLogoutClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseLogout = () => setAnchorEl(null);
  const handleLogoutRequest = async () => {
    beginAuthChange();
    try {
      await new MemberService().logout();
    } catch {
      sweetErrorHandling(Messages.error1);
      return;
    } finally {
      setAuthMember(null);
      setAnchorEl(null);
    }
    void sweetTopSuccessAlert("Logged out.", 1000);
  };

  return (
    <>
      <Navbar
        cartItems={cartItems}
        onAdd={onAdd}
        onRemove={onRemove}
        onDelete={onDelete}
        onDeleteAll={onDeleteAll}
        setSignupOpen={setSignupOpen}
        setLoginOpen={setLoginOpen}
        anchorEl={anchorEl}
        handleLogoutClick={handleLogoutClick}
        handleCloseLogout={handleCloseLogout}
        handleLogoutRequest={handleLogoutRequest}
      />
      <Switch>
        <Route path={["/products", "/advisor"]}>
          <ComparisonProvider><Switch>
            <Route path="/advisor"><AdvisorPage /></Route>
            <Route path="/products"><ProductsPage onAdd={onAdd} /></Route>
          </Switch></ComparisonProvider>
        </Route>
        <Route path="/orders">
          <ProtectedScreen><OrdersPage /></ProtectedScreen>
        </Route>
        <Route path="/member-page">
          <ProtectedScreen><UserPage /></ProtectedScreen>
        </Route>
        <Route path="/help">
          <HelpPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
      <Footer />

      <AuthenticationModal
        signupOpen={signupOpen}
        loginOpen={loginOpen}
        handleLoginClose={handleLoginClose}
        handleSignupOpen={() => { setLoginOpen(false); setSignupOpen(true); }}
        handleLoginOpen={() => { setSignupOpen(false); setLoginOpen(true); }}
        handleSignupClose={handleSignupClose}
      />
    </>
  );
}

export default App;
