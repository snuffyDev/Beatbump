/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="./lib/types"/>
interface CarouselHeader {
	browseId?: string
	title?: string
}
interface ICarousel {
	header: CarouselHeader
	results: CarouselItem[]
	isBrowse?: boolean
}
type Item = Song | PlaylistSearch | CarouselItem
