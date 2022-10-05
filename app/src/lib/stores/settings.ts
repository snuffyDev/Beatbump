import { browser } from "$app/environment";
import { ENV_DONATION_URL } from "../../env";
import { get, writable } from "svelte/store";

export type Theme = "Dark" | "Dim" | "Midnight" | "YTM";
export type StreamType = "HTTP" | "HLS";
enum Kind {
	Toggle = 0,
	Multi = 1,
	Text = 2,
	None = 3,
}
interface Appearance {
	Theme?: Theme;
	"Immersive Queue"?: boolean;
}
interface Search {
	Preserve?: "Category" | "Query" | "Category + Query" | "None";
}
interface Playback {
	"Prefer WebM Audio"?: boolean;
	"Dedupe Automix"?: boolean;
	Quality?: "Normal" | "Low";
	Stream?: StreamType;
}
interface Network {
	"HLS Stream Proxy": string;
}
interface AppInfo {
	Donate: string;
	GitHub: string;
}
export interface UserSettings {
	appearance: Appearance;
	playback: Playback;
	search: Search;
	network: Network;
	appinfo: AppInfo;
}

export const SettingsSchema = {
	appearance: {
		Theme: [Kind.Multi, ["Dark", "Dim", "Midnight", "YTM"]],
		"Immersive Queue": [Kind.Toggle, null],
	},
	playback: {
		"Dedupe Automix": [Kind.Toggle, null],
		"Prefer WebM Audio": [Kind.Toggle, null],
		Quality: [Kind.Multi, ["Normal", "Low"]],
		Stream: [Kind.Multi, ["HTTP", "HLS"]],
	},
	network: {
		"HLS Stream Proxy": [Kind.Text, "(WIP)"],
	},
	search: {
		Preserve: [Kind.Multi, ["Category", "Query", "Category + Query", "None"]],
	},
	about: {
		Donate: [Kind.None, ENV_DONATION_URL],

		GitHub: [Kind.None, "https://github.com/snuffyDev/Beatbump"],
	},
};

let list: UserSettings = {
	appearance: {
		Theme: "Dark",
		"Immersive Queue": true,
	},
	playback: {
		"Dedupe Automix": false,
		Quality: "Normal",
		"Prefer WebM Audio": false,
		Stream: "HTTP",
	},
	appinfo: { Donate: ENV_DONATION_URL, GitHub: "https://github.com/snuffyDev/Beatbump" },
	network: { "HLS Stream Proxy": "https://yt-hls-rewriter.onrender.com/" },
	search: { Preserve: "Category" },
};

const PWA_THEME_COLORS = {
	YTM: "#010102",
	Dark: "#17171d",
	Dim: "#141820",
	Midnight: "#0f0916",
};

const setTopBarTheme = (theme: Appearance["Theme"]) => {
	document.querySelector<HTMLMetaElement>("meta[name='theme-color']").content = PWA_THEME_COLORS[theme];
};

export const settings = _settings();

function _settings() {
	if (!browser) {
		return writable(list);
	}
	if ("localStorage" in self === false) return;
	const stored = JSON.parse(localStorage.getItem("settings")) as UserSettings;
	// Migrate from previous settings to new ones
	if (!stored?.appearance && !stored?.playback && !stored?.search) {
		const theme = localStorage.getItem("theme") as Lowercase<Appearance["Theme"]>;
		//@ts-expect-error it's correct, the compilers lying
		list.appearance.Theme =
			theme !== null
				? theme !== "ytm"
					? theme.slice(0).toUpperCase() + theme.slice(1)
					: "YTM"
				: list.appearance.Theme;

		list.playback["Prefer WebM Audio"] =
			(Boolean(localStorage.getItem("preferWebM")) as Playback["Prefer WebM Audio"]) ??
			list.playback["Prefer WebM Audio"];

		list.playback["Dedupe Automix"] =
			(Boolean(localStorage.getItem("theme")) as Playback["Dedupe Automix"]) ?? list.playback["Dedupe Automix"];

		localStorage.clear();
		localStorage.setItem("settings", JSON.stringify(list));
	} else {
		if (!stored.network["HLS Stream Proxy"]) {
			stored.network["HLS Stream Proxy"] = "https://yt-hls-rewriter.onrender.com/";
		}
		list = stored;
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
