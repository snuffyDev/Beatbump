const SERVER_MAP = {
	lh3: "https://lh3.googleusercontent.com",
	yt3: "https://yt3.ggpht.com",
	vi: "https://i.ytimg.com",
} as const;

const SLUG_BASE = Object.keys(SERVER_MAP) as (keyof typeof SERVER_MAP)[];

export const GET = async ({ fetch, params, request, url }) => {
	const FIRST_SLASH = params.slug.indexOf("/");
	const SLUG = params.slug.slice(0, FIRST_SLASH);
	const PATH =
		SLUG === "vi" ? `/${params.slug}` : params.slug.slice(FIRST_SLASH);
	const BASE = SERVER_MAP[SLUG as keyof typeof SERVER_MAP];
	console.log({ BASE, PATH, url });

	// Rewrite request to point to Google's thumbnail services.
	request = new Request(BASE + PATH, {
		headers: {
			host: new URL(BASE).host,
			"User-Agent":
				"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0",
		},
	});

	request.headers.set("Origin", new URL(BASE).origin);

	let response = await fetch(request);

	// Recreate the response from Google's servers
	response = new Response(response.body, response);

	// Set CORS headers
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.delete("Cookie");
	// Append to/Add Vary header so browser will cache response correctly
	response.headers.append("Vary", "Origin");

	return new Response(await response.arrayBuffer(), {
		...response.headers,
		status: response.status,
		headers: { ...response.headers },
	});
};
