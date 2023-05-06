export const MoodsAndGenresItem = (
	ctx: any,
): {
	text: any;
	color: string;
	endpoint: {
		params: any;
		browseId: any;
	};
} => {
	return {
		text: ctx.musicNavigationButtonRenderer?.buttonText.runs[0].text,
		color: ("00000000" + (ctx.musicNavigationButtonRenderer?.solid.leftStripeColor & 0xffffff).toString(16)).slice(-6),

		endpoint: {
			params: ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.params,
			browseId: ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.browseId,
		},
	};
};
