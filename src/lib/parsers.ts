const pb = (input, query, justOne = false) => {
	const iterate = (x, y) => {
		var r = [];

		x.hasOwnProperty(y) && r.push(x[y]);
		if (justOne && x.hasOwnProperty(y)) {
			return r.shift();
		}

		if (x instanceof Array) {
			for (let i = 0; i < x.length; i++) {
				r = r.concat(iterate(x[i], y));
			}
		} else if (x instanceof Object) {
			const c = Object.keys(x);
			if (c.length > 0) {
				for (let i = 0; i < c.length; i++) {
					r = r.concat(iterate(x[c[i]], y));
				}
			}
		}
		return r.length == 1 ? r.shift() : r;
	};

	let d = query.split(":"),
		v = input;
	for (let i = 0; i < d.length; i++) {
		v = iterate(v, d[i]);
	}
	return v;
};
export const parseSearchResult = (data, cont) => {
	/*
        data = response data
        cont = continuation
    */
	let continuation;

	let didYouMean;
	let ctx;

	if (cont) {
		// if has continuation, context = data
		ctx = [data];
	} else {
		/*  Error Handling
            Message Renderer is for when something goes horribly wrong,
            itemSectionRenderer is for when there's an error
        */
		if (data[0].messageRenderer) return [];
		if (data[0].itemSectionRenderer) {
			if (data[0].itemSectionRenderer.contents[0].messageRenderer)
				return { error: "No Results Found" };
			didYouMean = correctedQuery(
				data[0].itemSectionRenderer.contents[0].didYouMeanRenderer
			);

			ctx = [data[1]];
		} else {
			ctx = [data[0]];
		}
	}
	// Safety net
	if (ctx.itemSectionRenderer) return [];

	let results = [];

	ctx.map((c) => {
		let contents = [];
		if (cont) {
			let { musicShelfContinuation } = c;
			contents = musicShelfContinuation;
		} else {
			let { musicShelfRenderer } = c;
			contents = musicShelfRenderer;
		}
		/* Search for if the request is for Playlists
           If not, then parse song request.
        */
		if (contents?.title?.runs[0]?.text?.includes("playlists")) {
			// Check for continuation request
			if (contents.hasOwnProperty("continuations")) {
				continuation = contents.continuations[0].nextContinuationData;
			}
			contents = contents.contents;

			results = playlist(contents);
		} else {
			/* Search for if the request is for songs/videos
           Then check if request contains a continuation request
        */
			if (contents.hasOwnProperty("continuations")) {
				continuation = contents.continuations[0].nextContinuationData;
			}
			contents = contents.contents;
			results = parseSong(contents);
		}
	});
	if (didYouMean !== undefined) {
		return {
			contents: results,
			didYouMean: didYouMean,
			continuation: false,
		};
	}
	return { contents: results, continuation: continuation };
};
/* Return the data for if there is a corrected query */
const correctedQuery = (ctx) => {
	let correctTerm = ctx.correctedQuery.runs[0].text;
	let correctedEndpoint = ctx.correctedQueryEndpoint.searchEndpoint;

	return {
		term: correctTerm,
		endpoint: correctedEndpoint,
	};
};

function parseSong(contents) {
	let type = "song";
	let results = [];

	contents.map(({ musicResponsiveListItemRenderer }) => {
		let d = musicResponsiveListItemRenderer;
		let explicit;
		if (d.hasOwnProperty("badges")) explicit = true;
		const flexColumns = pb(
			d,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);

		let thumbnails = d.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		let title = pb(flexColumns[0], "runs:text", true);
		let browse;
		let browseId;
		if (
			d.menu.menuRenderer.items[5].menuNavigationItemRenderer.navigationEndpoint
				.browseEndpoint
		) {
			let menu = pb(d.menu.menuRenderer, "items", true);
			let items = pb(menu, "menuNavigationItemRenderer");
			// console.log(items);
			if (items.length > 4) {
				browseId = items[3].navigationEndpoint.browseEndpoint.browseId;
			} else {
				browseId = undefined;
			}
		} else {
			browseId =
				d.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
					.navigationEndpoint.browseEndpoint.browseId;
		}
		let mixInfo =
			d.menu.menuRenderer.items[0].menuNavigationItemRenderer
				.navigationEndpoint;
		let { videoId, playlistId, params } = mixInfo.watchEndpoint;
		let metaInfo = pb(flexColumns[1], "runs:text", true);

		let length = metaInfo[metaInfo.length - 1];

		let artistsArr = metaInfo.reverse();
		let artists = artistsArr.slice(4);
		if (artists.length > 1) {
			for (var i = 0; i < artists.length; i++) {
				artists.splice(i + 1, 1);
			}
		}
		artists.reverse();
		let artistInfo = {
			browseId: browseId,
			artists: artists,
		};
		// console.log(artists, artists)
		let result = {
			artistInfo: artistInfo,
			title: title,
			videoId: videoId,
			type: type,
			params: params,
			length: length,
			playlistId: playlistId,
			thumbnails: thumbnails,
			explicit: explicit,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15),
		};
		results.push(result);
	});
	return results;
}
// Parse the playlist results for search.
export function playlist(contents) {
	let results = [];

	let type = "playlist";
	contents.map(({ musicResponsiveListItemRenderer }) => {
		const d = musicResponsiveListItemRenderer;
		let thumbnails = d.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		let browseId = d.navigationEndpoint.browseEndpoint.browseId;
		let title =
			d.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
				.text;
		const flexColumns = pb(
			d,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);
		let metaData = pb(flexColumns[1], "runs:text", true);
		metaData = metaData.join("");
		console.log(metaData);
		let watchPlaylistEndpoint =
			d.menu.menuRenderer.items[0].menuNavigationItemRenderer.navigationEndpoint
				.watchPlaylistEndpoint;
		let result = {
			thumbnails: thumbnails,
			browseId: browseId,
			playlistInfo: metaData,
			shuffle: watchPlaylistEndpoint,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15),
			title: title,
			type: type,
		};
		results.push(result);
	});
	return results;
}
