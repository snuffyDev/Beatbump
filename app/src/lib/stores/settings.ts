import { browser } from "$app/environment";
import type { NestedKeyOf } from "$lib/types/utilities";
import { get, writable, type Writable } from "svelte/store";
import { ENV_DONATION_URL } from "../../env";

export type Theme = "Dark" | "Dim" | "Midnight" | "YTM";
export type StreamType = "HTTP" | "HLS";

interface Appearance {
	Theme?: Theme;
	"Immersive Queue"?: boolean;
}
interface Search {
	Preserve?: "Category" | "Query" | "Category + Query" | "None";
	Restricted?: boolean;
}
interface Playback {
	"Prefer WebM Audio"?: boolean;
	"Dedupe Automix"?: boolean;
	"Remember Last Track"?: boolean;
	Quality?: "Normal" | "Low";
	Stream?: StreamType;
}
interface Network {
	"HLS Stream Proxy": string;
	"Proxy Thumbnails": boolean;
}
interface AppInfo {
	Donate: string;
	GitHub: string;
}
export type UserSettings = {
	appearance: Appearance;
	playback: Playback;
	search: Search;
	network: Network;
	appinfo: AppInfo;
};

let list: UserSettings = {
	appearance: {
		Theme: "Dark",
		"Immersive Queue": true,
	},
	playback: {
		"Dedupe Automix": false,
		Quality: "Normal",
		"Remember Last Track": false,
		"Prefer WebM Audio": false,
		Stream: "HTTP",
	},
	appinfo: {
		Donate: ENV_DONATION_URL,
		GitHub: "https://github.com/snuffyDev/Beatbump",
	},
	network: {
		"HLS Stream Proxy": "https://yt-hls-rewriter.onrender.com/",
		"Proxy Thumbnails": true,
	},
	search: { Preserve: "Category", Restricted: false },
};

export const SERVER_PERSISTED_SETTING_KEYS: Extract<NestedKeyOf<UserSettings>, 'Restricted' | "Proxy Thumbnails">[] = [
	"Restricted",
	"Proxy Thumbnails",
];

const PWA_THEME_COLORS = {
	YTM: "#010102",
	Dark: "#17171d",
	Dim: "#141820",
	Midnight: "#0f0916",
};

const setTopBarTheme = (theme: Appearance["Theme"]) => {
	document.querySelector<HTMLMetaElement>("meta[name='theme-color']").content =
		PWA_THEME_COLORS[theme];
};

export const settings = browser
	? _settings()
	: (writable() as unknown as ReturnType<typeof _settings>);

function _settings() {
	if (!browser) {
		return writable(list) as unknown as {
			subscribe: Writable<UserSettings>["subscribe"];
			set: Writable<UserSettings>["set"];
			value: () => UserSettings;
		};
	}
	if ("localStorage" in self === false)
		return writable({}) as unknown as {
			subscribe: Writable<UserSettings>["subscribe"];
			set: Writable<UserSettings>["set"];
			value: () => UserSettings;
		};
	// Migrate from previous settings to new ones
	const stored = JSON.parse(localStorage.getItem("settings")) as UserSettings;
	// Migrate from previous settings to new ones
	if (!stored?.appearance && !stored?.playback && !stored?.search) {
		const theme = localStorage.getItem("theme") as Lowercase<
			Appearance["Theme"]
		>;
		//@ts-expect-error it's correct, the compilers lying
		list.appearance.Theme =
			theme !== null
				? theme !== "ytm"
					? theme.slice(0).toUpperCase() + theme.slice(1)
					: "YTM"
				: list.appearance.Theme;

		list.playback["Prefer WebM Audio"] =
			(Boolean(
				localStorage.getItem("preferWebM"),
			) as Playback["Prefer WebM Audio"]) ?? list.playback["Prefer WebM Audio"];

		list.playback["Remember Last Track"] =
			(Boolean(
				localStorage.getItem("Remember Last Track"),
			) as Playback["Remember Last Track"]) ??
			list.playback["Remember Last Track"];

		list.playback["Dedupe Automix"] =
			(Boolean(localStorage.getItem("theme")) as Playback["Dedupe Automix"]) ??
			list.playback["Dedupe Automix"];

		localStorage.clear();
		localStorage.setItem("settings", JSON.stringify(list));
	} else {
		if (!stored?.network["HLS Stream Proxy"]) {
			stored.network["HLS Stream Proxy"] =
				"https://yt-hls-rewriter.onrender.com/";
		}
		if (!stored?.network["Proxy Thumbnails"]) {
			stored.network["Proxy Thumbnails"] = true;
		}
		if (stored?.search && typeof stored?.search?.Restricted === "undefined") {
			stored.search.Restricted = false;
		}
		list = stored as UserSettings;
	}

	const store = writable<UserSettings>(list);

	const { subscribe, update, set } = store;

	setTopBarTheme(list.appearance.Theme);

	function save(settings: UserSettings) {
		themeSet(settings.appearance.Theme as Theme);

		localStorage.setItem("settings", JSON.stringify(list));
	}
	function change<
		T extends keyof UserSettings = keyof UserSettings,
		K extends keyof UserSettings[T] = keyof UserSettings[T],
	>(category: T, key: K, value: UserSettings[T][K]) {
		list[category][key] = value;
		key === "Theme" && themeSet(value as unknown as Theme);
		update((u) => {
			key === "";
			return {
				[category]: {
					...u[category],
					[key]: value,
				},
				...u,
			};
		});
		save(list);
	}
	return {
		subscribe,
		change,
		value() {
			return get(store);
		},
		set: (settings: UserSettings) => {
			list = settings;
			save(settings);

			set(settings);
		},
	};
}

function themeSet(theme: Appearance["Theme"]) {
	if (!browser) return;
	const root = document.documentElement;
	const currentTheme = root.classList.item(0);
	root.classList.replace(currentTheme, theme);
}
