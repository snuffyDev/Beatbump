export interface Song {
	index: number
	itct: string
	title: string
	artistInfo: ArtistInfo
	videoId: string
	autoMixList: string
	thumbnail: string
	length: string
}

export interface ArtistInfo {
	pageType: string
	artist: string
	browseId: string
}

export interface result {
	title: string
	artist?: string
	endpoint?: string
	videoId: string
	playlistId: string
	params?: string
	thumbnails: []
	subtitle?: {}[]
}

export interface mixList {
	continuation: string
	autoMixList?: string
	artistId?: string
	itct?: string
	index?: number
	videoId: string
	title: string
	id?: number
	artist: string
	thumbnail?: string
	length: string
}
