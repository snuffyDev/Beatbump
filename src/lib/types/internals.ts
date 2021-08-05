import type { CarouselItem } from '$lib/types'
import type { EndpointOutput } from '@sveltejs/kit'
import type { DefaultBody } from '@sveltejs/kit/types/endpoint'

export type TrendingEndpoint = {
	body: { carouselItems?: CarouselItem[] | JSONValue }
}

export interface EndpointParams {
	query: URLSearchParams
}
