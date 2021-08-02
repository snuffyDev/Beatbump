# ```GET``` /api/search.json
This section will have all the information required for the search endpoint.

> This document is incomplete and may be missing information.

## Usage
YouTube Music's API expects certain steps to be taken before it receives certain parameters. Beatbump's API wrapper attempts to simplify the whole process.

Generally, you first want to make a request to ```/api/search.json``` with a query and a filter like so: ```/api/search.json?q={query}&filter={filter}``` ([list of filters](#filters))

This will respond with JSON in this shape:
```ts
type Search = {
	contents: SongResult[] | PlaylistSearch[]
	continuation: NextContinuationData
}

interface NextContinuationData {
	continuation: string
	clickTrackingParams: string
}
```
The initial request can be continued by using the ```continuation``` token and ```clickTrackingParams``` in a follow-up request.

```/api/search.json?q=&filter={filter}&ctoken={continuation}&params={clickTrackingParams}```

> It's important to leave the query parameter blank when paginating/continuing your initial request.

## Parameter Reference

***[Parameter Reference is incomplete -- work in progress]***

| Parameter 	| Description                                                                                                                                                                                  	| Example                                                                   	|
|-----------	|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|---------------------------------------------------------------------------	|
| q         	| Query for the content you want. Can be an artist name, playlist name, song, album etc.                                                                                                       	| ```/api/search.json?q=Panama```                                           	|
| filter    	| ***Required*** - Filter for the search. [Click Here](#filters) for the filters                                                                                                               	| ```/api/search.json?q=Panama&filter=EgWKAQIIAWoKEAMQBBAKEAkQBQ%3D%3D```   	|
| --------- 	| Parameters below are ***both required*** when paginating/continuing a search request 	| ------------------------                                                  	|
| ctoken    	| Continuation token - used by YouTube in many places. Here it is the equivalent<br>to triggering the infinite load on the search page.                                                        	|                                     	|
| params    	| Used in conjunction with ```ctoken``` to fetch paginated/continued results.                                                                                                                  	| ```/api/search.json?q=&filter=EgwK...&params=CAoQybc...&ctoken=EqMDEgZ...```	|


This endpoint's response typically will look like this:
## Response Type Definitions
```ts
// Response from Beatbump's endpoint
type Search = {
	contents: SongResult[] | PlaylistSearch[]
	continuation: NextContinuationData
}

// Shape of the continuation data object
interface NextContinuationData {
	continuation: string
	clickTrackingParams: string
}
```

```ts
// Song result also doubles as video and artist result
type SongResult = {
	album?: Album
	artistInfo?: ArtistInfo
	explicit?: string
	hash: string
	index?: number
	length?: string
	params?: string
	playlistId?: string
	title?: string
	thumbnails: [{ url: string }]
	type?: string
	videoId: string
}
// Playlist search result
interface PlaylistSearch {
	playlistId: string
	metaData?: string | string[]
	browseId?: string
	hash?: string
	title: string
	type?: string
	thumbnails?: Thumbnail[]
	continuation?: NextContinuationData
}
```

## Filters
* Songs: EgWKAQIIAWoKEAMQBBAKEAkQBQ%3D%3D
* Videos: EgWKAQIQAWoKEAMQBBAKEAkQBQ%3D%3D
* Artists: EgWKAQIgAWoKEAMQBBAKEAkQBQ%3D%3D

- Playlists:
	- All: EgWKAQIoAWoKEAMQBBAKEAUQCQ%3D%3D
	- Featured: EgeKAQQoADgBagwQDhAKEAkQAxAEEAU%3D
	- Community: EgeKAQQoAEABagwQDhAKEAkQAxAEEAU%3D

