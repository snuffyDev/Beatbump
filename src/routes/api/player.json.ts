export async function get({ query }) {
	const videoId = query.get("videoId");
	const playlistId = query.get("list");
	// console.log(videoId,playlistId)
	try {
		const response = await fetch(
			"https://music.youtube.com/youtubei/v1/player?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30",
			{
				method: "POST",
				body: JSON.stringify({
					videoId: `${videoId}`,
					context: {
						client: {
							// originalUrl: `https://music.youtube.com/watch?v=${videoId}&list=${playlistId}`,
							hl: "en",
							clientName: "ANDROID",
							clientVersion: "16.02",
						},
						playlistId: `${playlistId}`,

						captionParams: {},
						params: "igMDCNgE",
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
		const data = await response.json();

		return {
			status: 200,
			body: JSON.stringify(data),
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
