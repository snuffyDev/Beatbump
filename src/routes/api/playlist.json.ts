import type { Artist, Playlist, Thumbnail } from "$lib/types";
import { pb } from "$lib/utils";
import type { NextContinuationData, PlaylistItem } from "$lib/types";
import type { EndpointOutput } from "@sveltejs/kit";

/** Hits the YouTube Music API for a playlist page
 *	Currently is not fully implemented.
 *
 * @export get
 * @param {*} { query }
 * @return {*}  {Promise<EndpointOutput>}
 */
export async function get({ query }): Promise<EndpointOutput> {
	const browseId = query.get("list");
	// console.log(videoId,playlistId)
	try {
		const response = await fetch(
			"https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30",
			{
				method: "POST",
				body: JSON.stringify({
					context: {
						client: {
							clientName: "WEB_REMIX",
							clientVersion: "0.1",
						},

						user: {
							enableSafetyMode: false,
						},
					},
					browseId: `${browseId}`,
					browseEndpointContextMusicConfig: {
						pageType: "MUSIC_PAGE_TYPE_PLAYLIST",
					},
				}),
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					Origin: "https://music.youtube.com",
				},
			}
		);

		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { status: response.status, body: response.statusText };
		}
		const {
			header: { musicDetailHeaderRenderer },
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: {
										contents: [{ musicPlaylistShelfRenderer }],
									},
								},
							},
						},
					],
				},
			},
		} = await response.json();
		// const playlist = pb(
		// 	contents,
		// 	"singleColumnBrowseResultsRenderer:tabs:0:tabRenderer:content:sectionListRenderer:contents:0:musicPlaylistShelfRenderer",
		// 	true
		// );
		const playlist: {
			contents: [];
			continuations: [];
			playlistId: string;
		} = musicPlaylistShelfRenderer;
		const playlistId = playlist.playlistId;
		// console.log(playlist)
		const continuations: NextContinuationData =
			playlist.continuations[0].nextContinuationData;
		//  pb(
		// 	playlist,
		// 	"continuations:0:nextContinuationData",
		// 	false
		// );
		const parseHeader = Array(musicDetailHeaderRenderer).map(
			({ description, subtitle, thumbnail, secondSubtitle, title }) => {
				// const description = description.runs[0].text
				const subtitles: string = pb(subtitle, "runs:text", true);
				// const thumbnails = pb(
				// 	d,
				// 	"thumbnail:croppedSquareThumbnailRenderer:thumbnail:thumbnails",
				// 	false
				// );
				secondSubtitle = pb(secondSubtitle, "runs:text", true);
				// const title = pb(d, "title:runs:0:text", true);

				return {
					description: description.runs[0].text,
					subtitles,
					thumbnails:
						thumbnail["croppedSquareThumbnailRenderer"]["thumbnail"][
							"thumbnails"
						],
					secondSubtitle,
					title: title.runs[0].text,
				};
			}
		)[0];

		const parseTrack: Array<PlaylistItem> = playlist.contents.map(
			({ musicResponsiveListItemRenderer: ctx }) => {
				const length = pb(
					ctx,
					"fixedColumns:0:musicResponsiveListItemFixedColumnRenderer:text:runs:0:text",
					true
				);
				const flexColumns = pb(ctx, "flexColumns");

				const artistEndpoint = pb(
					flexColumns,
					"musicResponsiveListItemFlexColumnRenderer:1:text:runs:0",
					true
				);
				const titleBody = pb(
					flexColumns,
					"musicResponsiveListItemFlexColumnRenderer:0:text:runs:0",
					true
				);
				const {
					videoId,
					playlistId,
				} = titleBody.navigationEndpoint.watchEndpoint;
				const title = titleBody.text;

				const artist: Artist = {
					name: artistEndpoint.text,
					browseId: artistEndpoint.navigationEndpoint.browseEndpoint.browseId,
				};
				const thumbnail: Thumbnail = pb(
					ctx,
					"thumbnail:musicThumbnailRenderer:thumbnail:thumbnails",
					true
				);

				// console.log(length, flexColumns, artist);
				return { length, videoId, playlistId, thumbnail, title, artist };
			}
		);
		// if (Object.prototype.hasOwnProperty.call(playlist,"continuations") {

		// }

		// console.log(items)
		// parsePlaylistContents(contents);
		return {
			status: 200,
			body: JSON.stringify({
				continuations: continuations,
				tracks: parseTrack,
				header: parseHeader,
			}),
		};
	} catch (error) {
		// output to netlify function log
		console.log(error);
		return {
			status: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message }),
		};
	}
}
