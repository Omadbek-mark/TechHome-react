import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Member } from "../../lib/types/member";
import { GlobalContext, AuthState } from "../hooks/useGlobals";
import MemberService from "../services/MemberService";
import { invalidateApiSession, SESSION_EXPIRED_EVENT } from "../../lib/api/client";
import { store } from "../store";

const sessionSignal = "techhome:session-change";
function clearPrivateState() {
  invalidateApiSession();
  store.dispatch({ type: "session/cleared" });
  try { localStorage.removeItem("memberData"); } catch { /* Storage may be disabled. */ }
}

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [authMember, updateMember] = useState<Member | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [orderBuilder, setOrderBuilder] = useState(new Date());
  const generation = useRef(0);
  const authChanging = useRef(false);
  const identity = useRef<string | null>(null);

  const change = useCallback((member: Member | null, publish = false) => {
    generation.current++;
    const nextId = member?._id ?? null;
    if (identity.current !== nextId || !member) clearPrivateState();
    identity.current = nextId;
    updateMember(member);
    setAuthState(member ? "authenticated" : "guest");
    if (publish) { try { localStorage.setItem(sessionSignal, `${Date.now()}-${Math.random()}`); } catch { /* Session still works in memory. */ } }
  }, []);
  const setAuthMember = useCallback((member: Member | null) => {
    authChanging.current = false;
    change(member, true);
  }, [change]);
  const resetSession = useCallback(() => {
    generation.current++;
    identity.current = null;
    clearPrivateState();
    updateMember(null);
    setAuthState("loading");
  }, []);
  const beginAuthChange = useCallback(() => {
    authChanging.current = true;
    resetSession();
  }, [resetSession]);
  const refreshSession = useCallback(async () => {
    if (authChanging.current) return;
    const started = ++generation.current;
    setAuthState((current) => current === "authenticated" ? current : "loading");
    try {
      const member = await new MemberService().getMemberDetail();
      if (started === generation.current) change(member);
    } catch (error) {
      if (started !== generation.current || axios.isCancel(error)) return;
      if (axios.isAxiosError(error) && error.response?.status === 401) change(null);
      else setAuthState((current) => current === "authenticated" ? current : "error");
    }
  }, [change]);
  useEffect(() => {
    clearPrivateState();
    const expired = () => {
      if (!authChanging.current) change(null);
    };
    const focus = () => {
      if (authChanging.current) return;
      resetSession();
      void refreshSession();
    };
    const crossTab = (event: StorageEvent) => {
      if (event.key === sessionSignal) focus();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    window.addEventListener("storage", crossTab);
    window.addEventListener("focus", focus);
    void refreshSession();
    return () => {
      generation.current++;
      window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
      window.removeEventListener("storage", crossTab);
      window.removeEventListener("focus", focus);
    };
  }, [change, refreshSession, resetSession]);
  return <GlobalContext.Provider value={{ authMember, authState, setAuthMember, beginAuthChange, refreshSession, orderBuilder, setOrderBuilder }}>
    {children}
  </GlobalContext.Provider>;
};
export default ContextProvider;
