import type icons from "$lib/components/Icon/icons";

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
	| "Album Radio";

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
	action: (...args) => Promise<void> | void;
};

export const DROPDOWN_ITEMS = {
	"View Artist": { text: "View Artist", icon: "artist" },
	"Add to Queue": { text: "Add to Queue", icon: "queue" },
	"Play Next": { text: "Play Next", icon: "queue" },
	Favorite: { text: "Favorite", icon: "heart" },
	"Start Group Session": { text: "Start Group Session", icon: "users" },
	Share: { text: "Share", icon: "share" },
	"Go to Album": { text: "Go to Album", icon: "album" },
	"Invite Group Session": { text: "Invite Group Session", icon: "send" },
	"View Playlist": { text: "View Playlist", icon: "list" },
	"Play Song Radio": { text: "Play Song Radio", icon: "radio" },
	"Remove From Playlist": { text: "Remove From Playlist", icon: "x" },
	"Add to Playlist": { text: "Add to Playlist", icon: "list-plus" },
	"Add to Favorites": { text: "Add to Favorites", icon: "heart" },
	"Share Group Session": { text: "Share Group Session", icon: "share" },
	Shuffle: { text: "Shuffle", icon: "shuffle" },
	"Shuffle Playlist": { text: "Shuffle", icon: "shuffle" },
} as const;

function buildDropdown() {}
