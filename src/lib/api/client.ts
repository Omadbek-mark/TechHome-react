import axios, { CanceledError } from "axios";
import { serverApi } from "../config";

declare module "axios" {
  interface InternalAxiosRequestConfig { sessionEpoch?: number; }
}
export const SESSION_EXPIRED_EVENT = "techhome:session-expired";
export const api = axios.create({ baseURL: serverApi, withCredentials: true });
let epoch = 0;
let token: string | undefined;
let pending: Promise<string> | undefined;

export function invalidateApiSession() {
  epoch++;
  token = undefined;
  pending = undefined;
}

async function csrf(): Promise<string> {
  if (token) return token;
  if (pending) return pending;
  const started = epoch;
  const task = api.get<{ csrfToken: string }>("/member/csrf").then(({ data }) => {
    if (started !== epoch) throw new CanceledError("Session changed");
    if (!/^[a-f0-9]{64}$/.test(data.csrfToken)) throw new Error("Invalid session response");
    token = data.csrfToken;
    return token;
  }).finally(() => { if (pending === task) pending = undefined; });
  pending = task;
  return task;
}

api.interceptors.request.use(async (config) => {
  const started = epoch;
  if (!["get", "head", "options"].includes((config.method ?? "get").toLowerCase())) {
    config.headers.set("X-CSRF-Token", await csrf());
  }
  if (started !== epoch) throw new CanceledError("Session changed");
  config.sessionEpoch = started;
  return config;
});

api.interceptors.response.use((response) => {
  if (response.config.sessionEpoch !== epoch) throw new CanceledError("Session changed");
  if (typeof response.data?.csrfToken === "string") token = response.data.csrfToken;
  return response;
}, (error) => {
  if (error.config?.sessionEpoch !== undefined && error.config.sessionEpoch !== epoch) {
    return Promise.reject(new CanceledError("Session changed"));
  }
  if (error.response?.data?.code === "CSRF_INVALID") { token = undefined; pending = undefined; }
  if (error.response?.status === 401 && !["/member/login", "/member/signup"].includes(error.config?.url)) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  // Never automatically replay mutations, including uploads and orders.
  return Promise.reject(error);
});
