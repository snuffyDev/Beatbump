import type {
	Thumbnail,
	NextContinuationData,
	Artist,
	TitleEndpoint,
} from "$lib/types";
export interface Header {
	description: string;
	title: string;
	thumbnails: Thumbnail[];
	secondSubtitle?: string[] | string;
	playlistId: string;
	subtitles?: string;
}
export interface Playlist {
	thumbnails?: Thumbnail[];
	continuation?: NextContinuationData;
	contents: PlaylistItem[];
}
export interface PlaylistSearch {
	playlistId: string;
	metaData?: string | string[];
	browseId?: string;
	hash?: string;
	title: string;
	type?: string;
	thumbnails?: Thumbnail[];
	continuation?: NextContinuationData;
}
export interface Menu {
	text: string;
	playlistId?: string;
	videoId?: string;
	params?: string;
	browseId?: string;
}
export interface PlaylistItem {
	navigation?: Menu[];
	length?: string;
	title: string | TitleEndpoint;
	artist: Artist;
	thumbnail: Thumbnail[];
	videoId?: string;
	playlistId?: string;
}
