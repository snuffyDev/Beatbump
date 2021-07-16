export function addToQueue(data, mixList, key) {
	let next = {
		continuation: mixList[0].continuation,
		autoMixList: data.playlistId,
		artistId: data.artistInfo.browseId,
		id: key + 1,
		videoId: data.videoId,
		title: data.title,
		artist: data.artistInfo.artists[0],
		thumbnail: data.thumbnail,
		length: data.length,
	};
	return mixList.splice(key + 1, 0, next);
	console.log(mixList);
}
