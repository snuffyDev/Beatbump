import { writable } from "svelte/store";

import type { Writable } from "svelte/store";

type Tags = {
	title: string;
	description: string;
	url: string;
	type?: string;
	image: string;
	"og:image": string;
	"og:description": string;
	"og:type"?: string;
	"og:url": string;
};

const tags: Tags = {
	title: "Beatbump",
	description: "Unlock your music",
	url: "https://beatbump.ml/",
	type: "website",
	image: "https://beatbump.ml/favicon.png",
	"og:image": "/favicon.png",
	"og:description": "Unlock your music",
	"og:type": "website",
	"og:url": "https://beatbump.ml/",
};

type Store = {
	subscribe: Writable<Tags>["subscribe"];
	set: Writable<Tags>["set"];
	title: (title: string) => void;
	url: (url: string) => void;
	desc: (desc: string) => void;
	image: (image: string) => void;
	init: (title?: string, url?: string, desc?: string, image?: string) => void;
};

const metatags = (): Store => {
	const { subscribe, set, update } = writable(tags);
	let origin = "https://beatbump.ml";
	const desc = (desc) => update((d) => ({ ...d, description: desc, "og:description": desc }));
	const title = (title) => update((t) => ({ ...t, title: title, "og:title": title }));
	const url = (url) =>
		update((u) => ({
			...u,
			"og:url": origin + url,
			url: origin + url,
		}));
	const image = (image) =>
		update((i) => ({
			...i,
			image: image,
			"og:image": image,
		}));
	const init = (
		_origin: string,
		_title: string,
		_url: string,
		_desc: string | undefined,
		_image = _origin + "/favicon.png",
	) => {
		_origin && (origin = origin);
		_title && title(_title);
		_url && url(_url);
		_desc && desc(_desc);
		_image && image(_image);
	};
	return {
		subscribe,
		set,
		title,
		url,
		desc,
		image,
		init,
	};
};

const tagStore = metatags();
export default tagStore;
