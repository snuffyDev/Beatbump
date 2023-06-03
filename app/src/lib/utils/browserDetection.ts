import { browser } from "$app/environment";

const USER_AGENT = browser ? navigator.userAgent : "null";

export const isAppleMobileDevice = browser
	? /i(Phone|Pad|Pod)/i.test(USER_AGENT) && navigator.maxTouchPoints > 1
	: false;

export const isSafari = browser
	? (USER_AGENT.indexOf("Safari") > -1 &&
			!/Chrome|Chromium|Edge?/i.test(USER_AGENT)) ||
	  isAppleMobileDevice
	: false;
