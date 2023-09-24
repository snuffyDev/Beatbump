import type { PreferencesCookie } from "$lib/server/cookies";

declare global {
	namespace App {
		interface Locals {
			iOS: boolean;
			Android: boolean;
			preferences: PreferencesCookie;
		}

		interface PageData {
			path?: string;
			iOS?: boolean;
			Android?: boolean;
			page?: string;
		}
	}
}
