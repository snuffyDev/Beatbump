export function thumbnailTransformer(url: string): {
	placeholder?: string;
	url?: string;
} {
	const output: {
		placeholder?: string;
		url?: string;
	} = {};
	if (!url.includes("lh3.googleusercontent.com")) {
		const split_url = url.split("?");
		const webp_url = split_url[0];
		output.url = webp_url;
		output.placeholder = webp_url?.replace("sddefault", "default");
	} else {
		const webp_url = url?.replace("-rj", "-rw");
		output.url = webp_url;

		output.placeholder = webp_url?.replace(
			/=(?:[wh][0-9].+?){2,}(-s)?/gm,

			"=w1-h1-p-fSoften=50,50,05",
		);
	}
	return output;
}
