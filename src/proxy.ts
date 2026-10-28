import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

/** Cookie set by the language switcher, then the browser's Accept-Language, then Russian. */
function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;
  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return accepted.find((code): code is Locale => hasLocale(code)) ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const current = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (current) {
    // Remember the language the visitor is reading so "/" sends them back to it.
    if (request.cookies.get(LOCALE_COOKIE)?.value === current) return;
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, current, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }
  request.nextUrl.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals and files with an extension (favicon.ico, images).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
