import type icons from "$lib/components/Icon/icons";

type DropdownItem = {
	text: string;
	icon: keyof typeof icons;
	action: (...args) => void;
};
type Dropdown = DropdownItem[];
type Labels =
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
	| "Remove From Playlist"
	| "Add to Favorites"
	| "Shuffle"
	| "Start Playlist"
	| "Edit Playlist"
	| "Start Radio"
	| "Play Album"
	| "Album Radio";
const DROPDOWN_TEXTS: Labels[] = [
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
type Icons =
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
	| "dots";
const DROPDOWN_ICONS: Icons[] = [
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
	"dots",
];

const DROPDOWN_ITEMS = {
	"View Artist": { text: "View Artist", icon: "artist" },
	"Add to Queue": { text: "Add to Queue", icon: "queue" },
	"Play Next": { text: "Play Next", icon: "queue" },
	Favorite: { text: "Favorite", icon: "heart" },
	"Start Group Session": { text: "Start Group Session", icon: "users" },
	Share: { text: "Share", icon: "share" },
	"Go to Album": { text: "Go to album", icon: "album" },
	"Invite Group Session": { text: "Invite Group Session", icon: "send" },
	"View Playlist": { text: "View Playlist", icon: "list" },
	"Play Song Radio": { text: "Play Song Radio", icon: "radio" },
	"Remove from Playlist": { text: "Remove from Playlist", icon: "x" },
	"Add to Playlist": { text: "Add to Playlist", icon: "playlist-add" },
	"Add to Favorites": { text: "Add to Favorites", icon: "heart" },
	"Share Group Session": { text: "Share Group Session", icon: "share" },
	Shuffle: { text: "Shuffle", icon: "shuffle" },
};

type Label = keyof typeof DROPDOWN_ITEMS;

const l: Label = "";
