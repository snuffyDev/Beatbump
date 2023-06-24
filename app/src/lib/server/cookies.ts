import type { SERVER_PERSISTED_SETTING_KEYS } from "$stores/settings";
import type { CookieSerializeOptions } from "cookie";

export const defaultCookieParams = (
	params: Partial<CookieSerializeOptions> = {},
): CookieSerializeOptions => ({
	path: "/",
	httpOnly: true,
	sameSite: "strict",
	expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
	secure: true,
	...params,
});

export type PreferencesCookie = Record<
	(typeof SERVER_PERSISTED_SETTING_KEYS)[number],
	boolean
>;
