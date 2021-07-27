import type { Album, ArtistInfo, NextContinuationData } from '$lib/types'
import type { PlaylistSearch } from './playlist'

export type Search = {
	contents: SongResult[] | PlaylistSearch
	continuation: NextContinuationData
}

export type SongResult = {
	album?: Album
	artistInfo?: ArtistInfo
	explicit?: string
	hash?: string
	index?: number
	length?: string
	params?: string
	playlistId?: string
	title?: string
	thumbnails: [{ url: string }]
	type?: string
	videoId: string
}
