import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { api, invalidateApiSession, SESSION_EXPIRED_EVENT } from "./client";
import MemberService from "../../app/services/MemberService";

const first = "a".repeat(64);
const second = "b".repeat(64);
const previousAdapter = api.defaults.adapter;
function reply(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return { config, data, status: 200, statusText: "OK", headers: {} };
}
beforeEach(() => invalidateApiSession());
afterEach(() => { api.defaults.adapter = previousAdapter; });

it("concurrent writes share one credentialed CSRF request", async () => {
  const requests: InternalAxiosRequestConfig[] = [];
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return reply(config, config.url === "/member/csrf" ? { csrfToken: first } : {});
  };
  await Promise.all([api.post("/order/create", []), api.post("/order/update", {})]);
  expect(requests.filter((config) => config.url === "/member/csrf")).toHaveLength(1);
  for (const config of requests) {
    expect(config.withCredentials).toBe(true);
    if (config.method === "post") expect(config.headers.get("X-CSRF-Token")).toBe(first);
  }
});

it("uses rotated CSRF after login and never saves a member or token in localStorage", async () => {
  const requests: InternalAxiosRequestConfig[] = [];
  api.defaults.adapter = async (config) => {
    requests.push(config);
    if (config.url === "/member/csrf") return reply(config, { csrfToken: first });
    if (config.url === "/member/login") return reply(config, { member: { _id: "fixture" }, csrfToken: second });
    return reply(config, {});
  };
  await new MemberService().login({ memberNick: "fixture", memberPassword: "fixture-only" });
  await new MemberService().updateMember({ memberNick: "fixture", memberImage: "ignored.svg" });
  const update = requests.find((config) => config.url === "/member/update")!;
  expect(update.headers.get("X-CSRF-Token")).toBe(second);
  expect(update.data).toBeInstanceOf(FormData);
  expect((update.data as FormData).has("memberImage")).toBe(false);
  expect(localStorage.getItem("memberData")).toBeNull();
});

it("does not automatically replay a mutation rejected by CSRF", async () => {
  let csrfCalls = 0;
  let writes = 0;
  api.defaults.adapter = async (config) => {
    if (config.url === "/member/csrf") { csrfCalls++; return reply(config, { csrfToken: first }); }
    writes++;
    if (writes === 1) throw new AxiosError("Forbidden", "ERR_BAD_REQUEST", config, undefined,
      { ...reply(config, { code: "CSRF_INVALID" }), status: 403 });
    return reply(config, {});
  };
  await expect(api.post("/order/create", [])).rejects.toBeInstanceOf(AxiosError);
  expect(writes).toBe(1);
  await api.post("/order/create", []);
  expect(writes).toBe(2);
  expect(csrfCalls).toBe(2);
});

it("discards responses from a previous identity", async () => {
  let finish!: (value: AxiosResponse) => void;
  let requestConfig!: InternalAxiosRequestConfig;
  api.defaults.adapter = (config) => { requestConfig = config; return new Promise((resolve) => { finish = resolve; }); };
  const response = api.get("/order/all");
  await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
  invalidateApiSession();
  finish(reply(requestConfig, [{ _id: "old-private-order" }]));
  await expect(response).rejects.toSatisfy(axios.isCancel);
});

it("notifies session expiry on a protected 401", async () => {
  const expired = vi.fn();
  window.addEventListener(SESSION_EXPIRED_EVENT, expired);
  try {
    api.defaults.adapter = async (config) => { throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined,
      { ...reply(config, {}), status: 401 }); };
    await expect(api.get("/member/detail")).rejects.toBeInstanceOf(AxiosError);
    expect(expired).toHaveBeenCalledOnce();
  } finally { window.removeEventListener(SESSION_EXPIRED_EVENT, expired); }
});
