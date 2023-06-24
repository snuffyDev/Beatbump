interface ArtistEndpointParams {
	browseId: string;
	browseEndpointContextMusicConfig: {
		browseEndpointContextMusicConfig: {
			pageType: "MUSIC_PAGE_TYPE_ARTIST";
		};
	};
}
interface RelatedEndpointParams {
	browseId: string;
	params: string;
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
	isAudioOnly: boolean;
	enablePersistentPlaylistPanel: boolean;
	playlistId?: string;
	tunerSettingValue: "AUTOMIX_SETTING_NORMAL";
	watchEndpointMusicSupportedConfigs: {
		watchEndpointMusicConfig?: {
			musicVideoType?: string | "MUSIC_VIDEO_TYPE_ATV";
		};
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
	SearchEndpointParams,
	RelatedEndpointParams,
};
