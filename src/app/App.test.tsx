import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import { store } from "./store";
import theme from "./MaterialTheme";
import ContextProvider from "./context/ContextProvider";
import ProductService from "./services/ProductService";
import MemberService from "./services/MemberService";
import OrderService from "./services/OrderService";
import { Member } from "../lib/types/member";
import { MemberType, MemberStatus } from "../lib/enums/member.enum";
import { Order } from "../lib/types/order";
import { SESSION_EXPIRED_EVENT } from "../lib/api/client";
import { productsData } from "../lib/data/products";

function renderApp(path = "/") {
  return render(
    <Provider store={store}>
      <ContextProvider>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
        </ThemeProvider>
      </ContextProvider>
    </Provider>,
  );
}

beforeEach(() => {
  vi.spyOn(MemberService.prototype, "getMemberDetail").mockRejectedValue(Object.assign(new Error("Guest"), { isAxiosError: true, response: { status: 401 } }));
  vi.spyOn(ProductService.prototype, "getProducts").mockResolvedValue([]);
  vi.spyOn(ProductService.prototype, "getCatalog").mockResolvedValue({ items: [], total: 0, page: 1, limit: 8 });
  vi.spyOn(ProductService.prototype, "getProduct").mockResolvedValue(productsData[0]);
});

describe("existing routes after the Vite migration", () => {
  it("renders the home page and requests the catalog without a live backend", async () => {
    renderApp();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Appliances for your everyday life.");
    await waitFor(() => expect(ProductService.prototype.getProducts).toHaveBeenCalledTimes(2));
    expect(ProductService.prototype.getProducts).toHaveBeenCalledWith({ page: 1, limit: 4, onSale: true });
    expect(screen.getByText("Popular products are not available.")).toBeInTheDocument();
  });

  it("navigates to the catalog through the existing Products link", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getAllByRole("link", { name: "Products" })[0]);
    expect(screen.getByRole("heading", { name: "All products" })).toBeInTheDocument();
    await waitFor(() => expect(ProductService.prototype.getCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 8 }),
    ));
  });

  it("loads a product detail with the actual Swiper ESM module", async () => {
    renderApp("/products/p01");
    expect(await screen.findByRole("heading", { name: productsData[0].productName })).toBeInTheDocument();
    expect(ProductService.prototype.getProduct).toHaveBeenCalledWith("p01");
  });

  it("opens and dismisses the migrated MUI login modal without submitting credentials", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(screen.getByRole("heading", { name: "Login Form" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Login Form" })).not.toBeInTheDocument());
  });

  it("never fetches orders before auth restoration and drops late orders after logout", async () => {
    let resolveProfile!: (member: Member) => void;
    let resolveOrders!: (orders: Order[]) => void;
    vi.mocked(MemberService.prototype.getMemberDetail).mockReturnValue(new Promise((resolve) => { resolveProfile = resolve; }));
    const orders = vi.spyOn(OrderService.prototype, "getMyOrders").mockReturnValue(new Promise((resolve) => { resolveOrders = resolve; }));
    renderApp("/orders");
    expect(screen.getByLabelText("Checking session")).toBeInTheDocument();
    expect(orders).not.toHaveBeenCalled();
    await act(async () => resolveProfile({ _id: "fixture", memberNick: "fixture", memberPhone: "fixture", memberType: MemberType.USER, memberStatus: MemberStatus.ACTIVE }));
    await waitFor(() => expect(orders).toHaveBeenCalledTimes(3));
    expect(screen.getByText(/Demo payment: no money is charged/)).toBeInTheDocument();
    expect(document.querySelector('input[name="cardNumber"], input[name="cardCVV"]')).toBeNull();
    await act(async () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)));
    await act(async () => resolveOrders([{ _id: "old-private-order" } as Order]));
    expect(store.getState().ordersPage.pausedOrders).toEqual([]);
    expect(store.getState().ordersPage.processOrders).toEqual([]);
    expect(store.getState().ordersPage.finishedOrders).toEqual([]);
  });
});

it('restores focus after keyboard dismissal of login and mobile navigation dialogs', async () => {
  const user = userEvent.setup(); renderApp();
  const login = screen.getByRole('button', { name: 'Login' });
  await user.click(login);
  expect(screen.getByRole('textbox', { name: 'username' })).toHaveFocus();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(login).toHaveFocus();
  const menu = screen.getByRole('button', { name: 'Open navigation' });
  await user.click(menu);
  expect(screen.getAllByRole('navigation', { name: 'Main navigation' }).length).toBeGreaterThan(0);
  await user.keyboard('{Escape}');
  await waitFor(() => expect(menu).toHaveFocus());
});


it('opens signup from login, switches back safely and submits the signup form', async () => {
  const user = userEvent.setup();
  const signup = vi.spyOn(MemberService.prototype, 'signup').mockResolvedValue({ _id: 'fixture', memberNick: 'host-fixture', memberPhone: '0000000000', memberType: MemberType.USER, memberStatus: MemberStatus.ACTIVE });
  renderApp();
  await user.click(screen.getByRole('button', { name: 'Login' }));
  await user.type(screen.getByLabelText(/password/i), 'do-not-carry-between-forms');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));
  expect(screen.getByRole('heading', { name: 'Signup Form' })).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toHaveValue('');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Login' }));
  expect(screen.getByRole('heading', { name: 'Login Form' })).toBeInTheDocument();
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));
  await user.type(screen.getByLabelText(/username/i), 'host-fixture');
  await user.type(screen.getByLabelText(/phone number/i), '0000000000');
  await user.type(screen.getByLabelText(/password/i), 'Local-fixture-2026');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign up' }));
  await waitFor(() => expect(signup).toHaveBeenCalledExactlyOnceWith({ memberNick: 'host-fixture', memberPhone: '0000000000', memberPassword: 'Local-fixture-2026' }));
  expect(await screen.findByRole('button', { name: 'Account menu' })).toBeInTheDocument();
});


it('keeps the original auth image and submits an existing spaced account name unchanged', async () => {
  const user = userEvent.setup();
  const login = vi.spyOn(MemberService.prototype, 'login').mockResolvedValue({ _id: 'fixture-admin', memberNick: 'Techhome Admin', memberPhone: '0000000000', memberType: MemberType.STORE, memberStatus: MemberStatus.ACTIVE });
  renderApp();
  await user.click(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByRole('dialog').querySelector('img.auth-image')).toHaveAttribute('src', '/img/auth1.webp');
  await user.type(screen.getByRole('textbox', { name: 'username' }), 'Techhome Admin');
  await user.type(screen.getByLabelText(/password/i), 'Fixture-password-2026');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Login' }));
  await waitFor(() => expect(login).toHaveBeenCalledExactlyOnceWith({ memberNick: 'Techhome Admin', memberPassword: 'Fixture-password-2026' }));
  expect(await screen.findByRole('button', { name: 'Account menu' })).toBeInTheDocument();
});
