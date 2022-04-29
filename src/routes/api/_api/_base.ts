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
interface SearchEndpointParams extends PlaylistEndpointContinuation {
	browseId: string;
	query: string;
	params?: string;
}

interface PlaylistEndpointContinuation {
	continuation?: string;
	ctoken?: string;
	itct?: string;
	type?: "next";
}
interface PlaylistEndpointParams {
	browseId: string;
	continuation?: string;
	itct?: string;
	type?: "next";
}

export type {
	ArtistEndpointParams,
	NextEndpointParams,
	PlaylistEndpointParams,
	PlaylistEndpointContinuation,
	PlayerEndpointParams,
	SearchEndpointParams
};
