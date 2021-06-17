// export async function extractTopResults(data) {
// 	const prop = [
// 		...data.map((d) => ({
// 			title:
// 				d.musicResponsiveListItemRenderer.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text,
// 			thumbnail: d.musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[0].url.replace(
// 				/=(w(\d+))-(h(\d+))/gm,
// 				'=w240-h240'
// 			),
// 			artist:
// 				d.musicResponsiveListItemRenderer.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
// 		}))
// 	]
// 	const topResults = [...prop.slice(0, 3)]

// 	return topResults
// }

export function extractTopResults(data) {}
