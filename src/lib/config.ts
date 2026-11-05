export function resolveApiUrl(value: string | undefined, frontendHostname: string, development: boolean): string {
  const apiUrl = value?.trim();
  if (!apiUrl) throw new Error("VITE_API_URL is required. See .env.example.");
  const parsed = new URL(apiUrl);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("VITE_API_URL must use HTTP or HTTPS.");
  }
  const loopback = (hostname: string) => ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  // Local cookies must use the same hostname as the page, including CSRF sessions.
  if (development && loopback(parsed.hostname) && loopback(frontendHostname)) {
    parsed.hostname = frontendHostname;
    return parsed.href.replace(/\/+$/, "");
  }
  return apiUrl.replace(/\/+$/, "");
}
export const serverApi = resolveApiUrl(import.meta.env.VITE_API_URL, window.location.hostname, import.meta.env.DEV);

export const Messages = {
  error1: "Something went wrong!",
  error2: "Please login first!",
  error3: "Please fulfill all inputs!",
  error4: "Message is empty!",
  error5: "Only images with jpeg, jpg, png format allowed!",
};
