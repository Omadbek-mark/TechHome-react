import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ContextProvider from "./ContextProvider";
import ProtectedScreen from "../components/auth/ProtectedScreen";
import { useGlobals } from "../hooks/useGlobals";
import MemberService from "../services/MemberService";
import { Member } from "../../lib/types/member";
import { MemberType, MemberStatus } from "../../lib/enums/member.enum";
import { store } from "../store";
import { setPausedOrders } from "../screens/ordersPage/slice";
import { Order } from "../../lib/types/order";
import { SESSION_EXPIRED_EVENT } from "../../lib/api/client";

const first: Member = { _id: "first", memberNick: "server-user", memberPhone: "fixture", memberType: MemberType.USER, memberStatus: MemberStatus.ACTIVE };
const second = { ...first, _id: "second", memberNick: "second-user" };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function Probe() {
  const { authState, authMember, setAuthMember } = useGlobals();
  return <><span data-testid="state">{authState}:{authMember?.memberNick}</span>
    <button onClick={() => setAuthMember(second)}>Switch identity</button>
    <ProtectedScreen><div>Private screen</div></ProtectedScreen></>;
}
function renderProbe() { return render(<MemoryRouter><ContextProvider><Probe /></ContextProvider></MemoryRouter>); }
beforeEach(() => store.dispatch({ type: "session/cleared" }));

it("does not trust corrupt localStorage and withholds private screens until the server responds", async () => {
  localStorage.setItem("memberData", "{broken-json");
  const profile = deferred<Member>();
  vi.spyOn(MemberService.prototype, "getMemberDetail").mockReturnValue(profile.promise);
  renderProbe();
  expect(screen.queryByText("Private screen")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Checking session")).toBeInTheDocument();
  await act(async () => profile.resolve(first));
  expect(await screen.findByText("Private screen")).toBeInTheDocument();
  expect(screen.getByTestId("state")).toHaveTextContent("authenticated:server-user");
  expect(localStorage.getItem("memberData")).toBeNull();
});

it("keeps private screens unmounted on a network error and supports retry", async () => {
  const profile = vi.spyOn(MemberService.prototype, "getMemberDetail").mockRejectedValueOnce(new Error("offline")).mockResolvedValue(first);
  const user = userEvent.setup();
  renderProbe();
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to check your session");
  expect(screen.queryByText("Private screen")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText("Private screen")).toBeInTheDocument();
  expect(profile).toHaveBeenCalledTimes(2);
});

it("clears private order cache immediately on session expiry", async () => {
  vi.spyOn(MemberService.prototype, "getMemberDetail").mockResolvedValue(first);
  renderProbe();
  await screen.findByText("Private screen");
  store.dispatch(setPausedOrders([{ _id: "private-order" } as Order]));
  await act(async () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)));
  expect(store.getState().ordersPage.pausedOrders).toEqual([]);
  expect(screen.queryByText("Private screen")).not.toBeInTheDocument();
  expect(screen.getByTestId("state")).toHaveTextContent("guest:");
});

it("a late restore response cannot replace a newly authenticated identity", async () => {
  const profile = deferred<Member>();
  vi.spyOn(MemberService.prototype, "getMemberDetail").mockReturnValue(profile.promise);
  const user = userEvent.setup();
  renderProbe();
  await user.click(screen.getByRole("button", { name: "Switch identity" }));
  await act(async () => profile.resolve(first));
  expect(screen.getByTestId("state")).toHaveTextContent("authenticated:second-user");
});
