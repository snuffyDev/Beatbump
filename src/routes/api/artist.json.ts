import BaseContext from '$api/_modules/context';
import { parseArtistPage } from '$lib/js/artistUtils';
import type { ICarousel } from '$lib/types';
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ url }) => {
	const browseId = url.searchParams.get('browseId');
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
			{
				method: 'POST',
				body: JSON.stringify({
					...BaseContext,
					browseEndpointContextMusicConfig: {
						browseEndpointContextMusicConfig: {
							pageType: 'MUSIC_PAGE_TYPE_ARTIST'
						}
					},
					browseId: `${browseId}`
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					'User-Agent':
						'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			}
		);
		const data = await response.json();
		const {
			header = {},

			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: { sectionListRenderer: { contents = [] } = {} } = {}
							} = {}
						} = {}
					] = []
				} = {}
			} = {}
		} = await data;
		// console.log(header)
		const parsed = parse(header, contents)[0];

		return {
			body: JSON.stringify(parsed),
			status: 200
			// headerRaw: header
		};
	} catch (err) {
		console.log(err);
		throw new Error(err);
	}
};

function parse(header, contents: any) {
	try {
		let carouselItems: ICarousel[] | null = [];
		const thumbnail = [];
		let description = '';
		let items = [];
		const headerContent = [];
		const newData = [parseArtistPage(header, contents)];
		return newData.map((d) => {
			carouselItems = d.carouselItems;
			headerContent.push(d[0]);
			if (d[0]) {
				d[0].thumbnails?.forEach((h: any) => {
					thumbnail.push(h);
				});
			}
			if (d?.songs) {
				items = d.songs;
			} else {
				items = undefined;
			}
			description = d[0]?.description;

			return {
				header: headerContent[0],
				songs: items,
				thumbnail,
				carousels: carouselItems,
				description,
				data: { header, contents }
			};
		});
	} catch (err) {
		console.error(err);
	}
}
