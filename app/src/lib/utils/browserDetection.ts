import { browser } from "$app/environment";

const USER_AGENT = browser ? navigator.userAgent : "null";

const isAppleMobileDevice = /i(Phone|Pad|Pod)/i.test(USER_AGENT);
export const isSafari =
	(USER_AGENT.indexOf("Safari") > -1 && !/Chrome|Chromium|Edge?/i.test(USER_AGENT)) || isAppleMobileDevice;
