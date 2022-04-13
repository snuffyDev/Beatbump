interface ArtistEndpointParams {
	browseId: string;
	browseEndpointContextMusicConfig: {
		browseEndpointContextMusicConfig: {
			pageType: "MUSIC_PAGE_TYPE_ARTIST";
		};
	};
}

interface PlayerEndpointParams {
	videoId: string;
	playlistId?: string;
	playerParams?: string;
}

interface NextEndpointParams {
	continuation?: string;
	params?: string;
	videoId?: string;
	playlistSetVideoId?: string;
	playlistId?: string;
	watchEndpointMusicConfig?: {
		musicVideoType?: string | "MUSIC_VIDEO_TYPE_ATV";
	};
}

interface PlaylistEndpointParams<T> {
	browseId: string;
	continuation?: string;
	itct?: string;
	type?: T extends "next" ? true : false;
}
