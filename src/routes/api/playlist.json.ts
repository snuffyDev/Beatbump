export async function get({ query }) {
	const browseId = query.get("browseId");
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
			return { statusCode: response.status, body: response.statusText };
		}
		const data = await response.json();

		return {
			statusCode: 200,
			body: JSON.stringify(data),
		};
	} catch (error) {
		// output to netlify function log
		console.log(error);
		return {
			statusCode: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message }),
		};
	}
}
