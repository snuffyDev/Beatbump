import type { Thumbnail, NextContinuationData, Artist, TitleEndpoint, ArtistInfo, Item } from "$lib/types";

export interface PlaylistSearch {
	playlistId: string;
	metaData?: string | string[];
	browseId?: string;
	hash?: string;
	title: string;
	type?: string;
	thumbnails?: Array<Thumbnail>;
	continuation?: NextContinuationData;
}
export type Menu = {
	text: string;
	playlistId?: string;
	videoId?: string;
	params?: string;
	browseId?: string;
};
export interface IPlaylistItem {
	navigation?: Menu[];
	length?: string;
	title: string | TitleEndpoint;
	thumbnail: Array<Thumbnail> | Thumbnail;
	artist?: Artist;
	artistInfo?: ArtistInfo;
	videoId?: string;
	playerParams?: string;
	playlistId?: string;
}
export type Header = {
	description?: string;
	subtitles?: [];
	thumbnails?: Array<Thumbnail>;
	playlistId?: string;
	secondSubtitle?: [];
	title?: string;
};

export type PlaylistData = {
	continuations: NextContinuationData;
	header?: Header;
	tracks: Item[];
};
