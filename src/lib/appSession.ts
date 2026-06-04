import { createHmac, timingSafeEqual } from "crypto";

export const APP_SESSION_COOKIE = "app_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function createAppSessionToken() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${signValue(issuedAt)}`;
}

export function isValidAppSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [issuedAt, signature] = token.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const ageSeconds = (Date.now() - Number(issuedAt)) / 1000;

  if (!Number.isFinite(ageSeconds) || ageSeconds > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  const expectedSignature = signValue(issuedAt);

  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}

export function getAppSessionCookieHeader(token: string) {
  return `${APP_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${getSecureCookieSuffix()}`;
}

export function getClearAppSessionCookieHeader() {
  return `${APP_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${getSecureCookieSuffix()}`;
}

export function getCookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function isRequestAuthenticated(request: Request) {
  return isValidAppSessionToken(
    getCookieValue(request.headers.get("cookie"), APP_SESSION_COOKIE),
  );
}

function signValue(value: string) {
  const secret = process.env.APP_SESSION_SECRET;

  if (!secret) {
    throw new Error("APP_SESSION_SECRET ontbreekt.");
  }

  return createHmac("sha256", secret).update(value).digest("hex");
}

function getSecureCookieSuffix() {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}
