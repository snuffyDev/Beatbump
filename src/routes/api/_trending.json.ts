import { pb } from "$lib/utils";
export async function getTrending() {
	let carouselItems: any[];
	let listNew;
	let titleNew;
	try {
		const response = await fetch(
			"/api/main.json?q=&endpoint=browse&browseId=FEmusic_explore"
		).then((data) => data.json());
		let {
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: { contents },
								},
							},
						},
					],
				},
			},
		} = await response;
		contents.forEach((content) => {
			if (content.hasOwnProperty("musicCarouselShelfRenderer")) {
				carouselItems.push(content);
			}
		});
		carouselItems = carouselItems.map(({ musicCarouselShelfRenderer }) => {
			let ctx = musicCarouselShelfRenderer;
			let { header, contents } = ctx;
			header = [header];
			header = [
				...header.map(({ musicCarouselShelfBasicHeaderRenderer }) => {
					let h = musicCarouselShelfBasicHeaderRenderer;
					return {
						title: pb(h, "title:runs:text", true),
						browseId: pb(
							h,
							"moreContentButton:buttonRenderer:navigationEndpoint:browseEndpoint:browseId",
							true
						),
					};
				}),
			];
			let results = [];

			contents.map((r) => {
				let type = Object.getOwnPropertyNames(r).toString();
				interface result {
					title: string;
					artist?: string;
					endpoint?: string;
					videoId: string;
					playlistId: string;
					params?: string;
					thumbnails: [];
					subtitle?: {}[];
				}
				let result: result;
				switch (type) {
					case "musicTwoRowItemRenderer":
						result = {
							title: r.musicTwoRowItemRenderer.title.runs[0].text,
							thumbnails:
								r.musicTwoRowItemRenderer.thumbnailRenderer
									.musicThumbnailRenderer.thumbnail.thumbnails,
							...r.musicTwoRowItemRenderer.navigationEndpoint.watchEndpoint,
							subtitle: [...r.musicTwoRowItemRenderer.subtitle.runs],
						};
						// console.log(result)

						break;
					case "musicResponsiveListItemRenderer":
						result = {
							subtitle: [
								...r.musicResponsiveListItemRenderer.flexColumns[1]
									.musicResponsiveListItemFlexColumnRenderer.text.runs,
							],
							title:
								r.musicResponsiveListItemRenderer.flexColumns[0]
									.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text,
							videoId:
								r.musicResponsiveListItemRenderer.flexColumns[0]
									.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
									.navigationEndpoint.watchEndpoint.videoId,
							playlistId:
								r.musicResponsiveListItemRenderer.menu.menuRenderer.items[0]
									.menuNavigationItemRenderer.navigationEndpoint.watchEndpoint
									.playlistId,
							thumbnails:
								r.musicResponsiveListItemRenderer.thumbnail
									.musicThumbnailRenderer.thumbnail.thumbnails,
						};
						// console.log(result, 'musicResponse')
						break;
					case "musicNavigationButtonRenderer":
						// console.log('nav')
						break;
					default:
						break;
				}
				results.push(result);
			});
			return {
				header,
				results,
			};
		});
		let newList = contents[1].musicCarouselShelfRenderer;

		titleNew =
			newList.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text;
		listNew = newList.contents;
		console.log(newList, carouselItems);
		if (newList.length !== 0) {
			return {
				status: 200,
				body: JSON.stringify({ carouselItems }),
			};
		}
	} catch (error) {
		return { status: 400, body: JSON.stringify(error) };
	}
}
