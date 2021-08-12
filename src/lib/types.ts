import type { PlaylistSearch } from './types/playlist'
export interface CarouselHeader {
	browseId?: string
	title?: string
}

interface MoodsAndGenresItem {
	color: string
	endpoint: { params: string }
	text: string
}
export interface ICarousel {
	header: CarouselHeader
	results: Array<CarouselItem & MoodsAndGenresItem>
	isBrowse?: boolean
}
export type Item = Song & PlaylistSearch & CarouselItem

export interface Album {
	browseId: string
	title: string
}
export type SearchContents = {
	results: PlaylistSearch[] | Song[]
	length: number
}
export interface Song {
	album?: Album
	index?: number
	itct?: string
	title?: string
	artistInfo?: ArtistInfo
	videoId: string
	type?: string
	playlistId?: string
	params?: string
	autoMixList?: string
	thumbnails: [{ url: string }]
	length?: string
	explicit?: string
	hash?: string
}

export interface Continuation {
	nextContinuationData: NextContinuationData
}

export interface NextContinuationData {
	continuation: string
	clickTrackingParams: string
}

export interface TitleEndpoint {
	title: string
	playlistId: string
	videoId: string
}
export interface Artist {
	browseId: string
	artist?: string[]
	artists?: string
}
export interface Thumbnail {
	url: string
}

export interface ArtistInfo {
	pageType?: string
	artist?: string | string[]
	browseId?: string
}

export interface Subtitle extends NavigationEndpoint {
	text: string
	browseId: string
	pageType: string
}

export type NavigationEndpoint = {
	navigationEndpoint: {
		browseEndpoint: {
			browseId: string
		}
	}
}

export interface SearchResult {
	title: string
	artist?: string
	endpoint?: string
	videoId: string
	playlistId: string
	params?: string
	thumbnails: [{ url: string }]
	subtitle?: Subtitle[]
}
export type CarouselItem = {
	artistInfo?: ArtistInfo
	title: string
	artist?: string
	endpoint?: ItemEndpoint & string
	aspectRatio?: string
	videoId: string
	playlistId: string
	explicit?: boolean
	params?: string
	thumbnails: [{ url: string; width: number }]
	subtitle?: Subtitle[]
}
export type ItemEndpoint = {
	browseId: string
	pageType: string
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
