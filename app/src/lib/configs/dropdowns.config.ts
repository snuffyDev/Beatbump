/* eslint-disable @typescript-eslint/no-empty-function */

export type Label =
	| "View Artist"
	| "Add to Queue"
	| "Play Next"
	| "Add to Playlist"
	| "Favorite"
	| "Start Group Session"
	| "Share Group Session"
	| "Share"
	| "Shuffle Playlist"
	| "Go to Album"
	| "Remove From Favorites"
	| "View Playlist"
	| "Play Song Radio"
	| "Add to Favorites"
	| "Remove From Playlist"
	| "Shuffle"
	| "Up Next"
	| "Related"
	| "Start Playlist"
	| "Edit Playlist"
	| "Start Radio"
	| "Play Album"
	| "Invite Group Session"
	| "Album Radio"
	| "Remove from Queue";

export type Dropdown = TypedDropdownItem<Label>[];
const DROPDOWN_TEXTS: ReadonlyArray<Label> = [
	"View Artist",
	"Add to Queue",
	"Play Next",
	"Add to Playlist",
	"Favorite",
	"Start Group Session",
	"Share Group Session",
	"Share",
	"Shuffle Playlist",
	"Go to Album",
	"Remove From Favorites",
	"View Playlist",
	"Play Song Radio",
	"Add to Favorites",
	"Shuffle",
	"Up Next",
	"Related",
	"Start Playlist",
	"Edit Playlist",
	"Start Radio",
	"Play Album",
	"Album Radio",
];

export type Icons =
	| "artist"
	| "queue"
	| "playlist-add"
	| "heart"
	| "users"
	| "share"
	| "shuffle"
	| "album"
	| "pause"
	| "x"
	| "send"
	| "list"
	| "radio"
	| "play"
	| "edit"
	| "list-plus"
	| "list-music"
	| "list-video"
	| "dots";

const DROPDOWN_ICONS: ReadonlyArray<Icons> = [
	"artist",
	"queue",
	"playlist-add",
	"heart",
	"users",
	"share",
	"shuffle",
	"album",
	"x",
	"send",
	"list",
	"radio",
	"play",
	"edit",
	"list-plus",
	"list-music",
	"list-video",
	"dots",
] as const;

export type TypedDropdownItem<T extends Label, I extends Icons = Icons> = {
	text: T;
	icon: I extends infer A ? A : I;
	action: (...args: any[]) => Promise<void> | void;
};

export const DROPDOWN_ITEMS: Partial<{
	[Key in Label]: Partial<TypedDropdownItem<Key, Icons>>;
}> = {
	"View Artist": { text: "View Artist", icon: "artist", action: () => {} },
	"Add to Queue": { text: "Add to Queue", icon: "queue", action: () => {} },
	"Play Next": { text: "Play Next", icon: "queue", action: () => {} },
	Favorite: { text: "Favorite", icon: "heart", action: () => {} },
	"Start Group Session": {
		text: "Start Group Session",
		icon: "users",
		action: () => {},
	},
	Share: { text: "Share", icon: "share", action: () => {} },
	"Go to Album": { text: "Go to Album", icon: "album", action: () => {} },
	"Invite Group Session": {
		text: "Invite Group Session",
		icon: "send",
		action: () => {},
	},
	"View Playlist": { text: "View Playlist", icon: "list", action: () => {} },
	"Play Song Radio": {
		text: "Play Song Radio",
		icon: "radio",
		action: () => {},
	},
	"Remove From Playlist": {
		text: "Remove From Playlist",
		icon: "x",
		action: () => {},
	},
	"Add to Playlist": {
		text: "Add to Playlist",
		icon: "list-plus",
		action: () => {},
	},
	"Add to Favorites": {
		text: "Add to Favorites",
		icon: "heart",
		action: () => {},
	},
	"Share Group Session": {
		text: "Share Group Session",
		icon: "share",
		action: () => {},
	},
	Shuffle: { text: "Shuffle", icon: "shuffle", action: () => {} },
	"Shuffle Playlist": {
		text: "Shuffle Playlist",
		icon: "shuffle",
		action: () => {},
	},
	"Album Radio": { text: "Album Radio", icon: "album", action: () => {} },
	"Edit Playlist": { icon: "edit", text: "Edit Playlist", action: () => {} },
	"Remove from Queue": {
		icon: "x",
		text: "Remove from Queue",
		action: () => {},
	},
};

export function buildDropdown() {
	const menu: TypedDropdownItem<Label, Icons>[] = [];
	return {
		add: function (
			label?: Label,
			action?: TypedDropdownItem<Label, Icons>["action"],
		) {
			if (!label && !action) return this;
			const item = Object.assign(
				{},
				DROPDOWN_ITEMS[label!],
			) as TypedDropdownItem<Label, Icons>;
			if (item) {
				item.action = action!;
				menu.push(item);
			}
			return this;
		},
		build: function () {
			return menu;
		},
	};
}
