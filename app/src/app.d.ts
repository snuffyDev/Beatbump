import type { PreferencesCookie } from "$lib/server/cookies";

declare global {
	namespace App {
		interface Locals {
			iOS: boolean;
			Android: boolean;
			preferences: PreferencesCookie;
		}

		interface Platform {}

		interface Session {
			iOS?: boolean;
			Android?: boolean;
		}

		interface PageData {
			path?: string;
			page?: string;
		}
	}
}
