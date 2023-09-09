interface ArtistEndpointParams {
	browseEndpointContextMusicConfig: {
		browseEndpointContextMusicConfig: {
			pageType: "MUSIC_PAGE_TYPE_ARTIST";
		};
	};
	browseId: string;
}
interface RelatedEndpointParams {
	browseId: string;
	params: string;
}
interface PlayerEndpointParams {
	playerParams?: string;
	playlistId?: string;
	videoId: string;
}

interface NextEndpointParams {
	continuation?: string;
	enablePersistentPlaylistPanel: boolean;
	isAudioOnly: boolean;
	params?: string;
	playlistId?: string;
	playlistSetVideoId?: string;
	tunerSettingValue: "AUTOMIX_SETTING_NORMAL";
	videoId?: string;
	watchEndpointMusicSupportedConfigs: {
		watchEndpointMusicConfig?: {
			musicVideoType?: string | "MUSIC_VIDEO_TYPE_ATV";
		};
	};
}
interface SearchEndpointParams extends PlaylistEndpointContinuation {
	browseId: string;
	params?: string;
	query: string;
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
	PlayerEndpointParams,
	PlaylistEndpointContinuation,
	PlaylistEndpointParams,
	RelatedEndpointParams,
	SearchEndpointParams,
};
