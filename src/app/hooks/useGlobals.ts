import { createContext, useContext } from "react";
import { Member } from "../../lib/types/member";

export type AuthState = "loading" | "authenticated" | "guest" | "error";

interface GlobalInterface {
  authState: AuthState;
  beginAuthChange: () => void;
  refreshSession: () => Promise<void>;
  authMember: Member | null;
  setAuthMember: (member: Member | null) => void;
  orderBuilder: Date;
  setOrderBuilder: (input: Date) => void;
}

export const GlobalContext = createContext<GlobalInterface | undefined>(undefined);

export const useGlobals = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) throw new Error("useGlobals within Provider");
  return context;
}