<script lang="ts">
	import Dropdown from "$components/Dropdown/Dropdown.svelte";

	export let data;
	import { fade } from "svelte/transition";
	import Loading from "$components/Loading/Loading.svelte";
	import { onMount } from "svelte";

	import { currentMix, currentTitle, key, currentTrack } from "$stores/stores";
	import * as utils from "$lib/utils";
	import Icon from "$components/Icon/Icon.svelte";
	import { goto } from "$app/navigation";
	import { addToQueue } from "$lib/actions/dropdown";
	import list from "$stores/list";
	// import { addToQueue } from '$lib/utils'

	let ctoken = "";
	let videoId = "";
	let playlistId = "";
	$: title = songTitle = "...";

	let src;
	let songTitle;
	let video;
	let thumbnail;

	let explicit;
	let clicked;
	let artist;
	let hidden = clicked ? true : false;
	let loading = false;
	let id = $key;
	onMount(() => {
		itemHandler();
	});

	const itemHandler = () => {
		explicit = data.explicit;
		title = data.title;
		thumbnail = data.thumbnails[0].url.replace(
			/=(w(\d+))-(h(\d+))/g,
			"=w256-h256"
		);
		if (data.type !== "playlist") {
			artist = data.artistInfo.artists[0];
		}
		if (title.length > 48) {
			title = title.substring(0, 48) + "...";
		} else {
			title = title;
		}
	};

	// console.log(type)

	const clickHandler = async () => {
		try {
			loading = true;
			videoId = data.videoId ? data.videoId : "";
			playlistId = data.playlistId ? data.playlistId : data.shuffle.playlistId;
			await list.initList(videoId, playlistId);
			key.set(0);
			console.log($list.mix);
			currentTrack.set({ ...$list.mix[0] });
			loading = false;
			return;
		} catch (error) {
			console.log(error);
			return;
		}
	};

	// 	if (data.type == "playlist") {
	// 		radio = await utils
	// 			.getNext(0, "", videoId, playlistId, ctoken)
	// 			.catch((err) => console.log(`error:` + err));
	// 	} else {
	// 		radio = await utils
	// 			.getNext(0, "", videoId, playlistId, ctoken)
	// 			.catch((err) => console.log(`error:` + err));
	// 	}
	// 	videoId = radio.results[0].videoId;
	// 	// console.log(radio, `radio`)
	// 	await utils.getSrc(videoId);
	// 	let thumbnail = radio.results[0].thumbnail;
	// 	currentMix.set({
	// 		videoId: `${videoId}`,
	// 		playlistId: `${playlistId}`,
	// 		list: [
	// 			...radio.results.map((d, i) => ({
	// 				autoMixList: d.autoMixList,
	// 				continuation: radio.continuation,
	// 				artistId: d.artistInfo.browseId,
	// 				itct: radio.itct,
	// 				id: d.index,
	// 				videoId: d.videoId,
	// 				title: d.title,
	// 				artist: d.artistInfo.artist,
	// 				thumbnail: d.thumbnail,
	// 				length: d.length,
	// 			})),
	// 		],
	// 	});
	// 	currentTitle.set(title);

	// 	currentTrack.set({ ...radio[0] });
	// 	key.set(0);

	// 	loading = false;
	// };

	let mixList = $currentMix.list;
	let showing;
	$: toggle = showing ? true : false;
</script>

<div class="container" class:hidden>
	<div class="innercard">
		<div
			class="itemWrapper"
			on:click={() => {
				if (!loading) {
					clickHandler();
				}
			}}>
			<div class="img-container">
				{#if loading}
					<Loading size="3em" />
				{/if}
				<div class="thumbnail">
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						id="img"
						referrerpolicy="origin-when-cross-origin"
						data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+PGRlZnM+PHBhdGggZD0iTTAgMGg1MTJ2NTEySDBWMHoiIGlkPSJwcmVmaXhfX2EiLz48L2RlZnM+PHVzZSB4bGluazpocmVmPSIjcHJlZml4X19hIiBvcGFjaXR5PSIuMjUiIGZpbGw9IiMyMjIiLz48L3N2Zz4="
						loading="lazy"
						src={thumbnail}
						alt="thumbnail"
						transition:fade />
				</div>
			</div>
			<div class="title">
				<span class="text-title">{title}</span>
				{#if explicit}
					<span class="explicit"> E </span>
				{/if}
				<p>
					{data.type == "playlist" ? `${data.metaData}` : `by ${artist}`}
				</p>
			</div>
		</div>
		<div class="menu">
			<Dropdown>
				<div slot="content">
					<div
						class:hidden={data.type == "playlist"}
						class="dd-item"
						on:click={() => {
							scrollTo({ top: 0, left: 0, behavior: "smooth" });
							goto(`/artist?id=${data.artistInfo?.browseId}`, {
								replaceState: true,
							});
						}}
						href={`/artist?id=${data.artistInfo?.browseId}`}>
						<Icon name="artist" size="1.5em" />
						<div class="dd-text">View Artist</div>
					</div>
					<div
						class="dd-item"
						on:click={() => {
							scrollTo({ top: 0, left: 0, behavior: "smooth" });
							goto(`/playlist?list=${data?.browseId}`);
						}}
						class:hidden={data.type !== "playlist"}>
						<Icon name="list" size="1.5em" />
						<div class="dd-text">Go to Playlist Page</div>
					</div>
					<div
						class="dd-item"
						on:click={() => {
							addToQueue(data, mixList, id);
						}}>
						<Icon name="queue" size="1.5rem" />
						<div class="dd-text">Add to Queue</div>
					</div>
				</div>
			</Dropdown>
		</div>
	</div>
</div>

<style lang="scss">
	.menu {
		// position: absolute;
		// right: 0.8rem;
		// top: 50%;
		position: relative;
		padding-top: 0.125rem;
		padding-right: 0.625rem;
	}
	.hidden {
		display: none;
	}
	.itemWrapper {
		display: flex;
		width: 100%;
		margin: 0;
		/* margin-bottom: auto; */
		padding: 0.3rem;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
	}
	p {
		margin: 0.2em 0;
	}
	// .listItem {
	// 	width: 100%;
	// 	display: flex;
	// 	padding: 0rem 1rem;
	// 	align-items: center;
	// 	cursor: pointer;
	// 	margin: 0;
	// 	.list-icon {
	// 		display: inline;
	// 	}
	// 	.list-item-text {
	// 		display: inline;
	// 		margin-left: 0.5rem;
	// 	}
	// 	&:hover {
	// 		background: #313338;
	// 		transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.1s;
	// 	}
	// }

	.container:not(.menu) {
		display: flex;
		flex: 1 1 auto;
		// margin-top: 0.125rem;
		// margin-bottom: 0.125rem;

		// isolation: isolate;
		border-bottom: 0.0714rem solid hsla(0, 0%, 66.7%, 0.24);
		width: 100%;
		/* height: 6rem; */
		/* margin: 0; */
		flex-direction: column;
		flex-wrap: nowrap;

		&:active:not(.menu) {
			background: lighten(#212225, 3%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
		}
	}

	.explicit {
		text-shadow: none;
		width: 1rem;
		height: 1rem;
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
			Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
		font-size: 0.7143rem;
		flex: none;
		color: #000;
		font-weight: 700;
		filter: contrast(100%);
		background: hsla(0, 0%, 100%, 0.966);
		padding: 0 0.4em;
		margin-left: 0.3em;
	}
	.text-title {
		&:hover {
			text-decoration: underline solid white 0.0714rem;
			cursor: pointer;
		}
	}
	img {
		width: auto;
		height: auto;
	}
	img::before {
		display: block;
		content: "";
		padding-top: calc(100% * 2 / 3);
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.innercard {
		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		/* padding: 0.3rem 0.3rem; */
		flex-wrap: nowrap;
	}

	.title {
		display: inline-block;
		width: 100%;
		margin-left: 1rem;
	}
	.img-container {
		// position: relative;
		/* width: 100%; */

		/* height: clamp(10rem,12.5rem,15rem); */
		/* min-width: 100%; */
		// box-shadow: 0 0 1rem 0.5rem rgb(0 0 0 / 36%);
		position: relative;
		display: block;
		width: auto;
		height: auto;
		width: 100%;
		max-width: 5rem;
		min-width: 5rem;
		height: 5rem;
		.thumbnail {
			width: 100%;
			height: 100%;
			background: rgba(13, 13, 15, 0.3411764705882353);
			img {
				// height: inherit;
				// -o-object-fit: scale-down;
				// object-fit: scale-down;
				// // max-height: 12rem;
				// width: 100%;
				// max-width: 18rem;
				width: 100%;
				height: 100%;
				-o-object-fit: scale-down;
				object-fit: scale-down;
			}
		}
	}
	@media (min-width: 640px) {
		.container:hover:not(.menu) {
			pointer-events: all;
			background: lighten(#212225, 3%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
		}
	}
</style>
