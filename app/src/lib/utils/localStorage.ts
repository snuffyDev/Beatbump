import { browser } from "$app/environment";

class LS {
	static get<T>(key: string): T {
		if (!browser) return;
	}
}
