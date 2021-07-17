import type {
	Thumbnail,
	NextContinuationData,
	Artist,
	TitleEndpoint,
} from "$lib/types";
export interface Playlist {
	playlistId: string;
	metaData?: string | string[];
	browseId?: string;
	hash?: string;
	title: string;
	type?: string;
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
export interface PlaylistItem {
	length?: string;
	title: string | TitleEndpoint;
	artist: Artist;
	thumbnail: Thumbnail[];
	videoId?: string;
	playlistId?: string;
}
