<script context="module" lang="ts">
	// import type { Load } from "@sveltejs/kit";
	// let path;
	// export const load: Load = async ({ stuff, url, fetch }) => {
	// 	path = stuff.page;
	// 	const browseId = url.searchParams.get("id") || "";
	// 	const pt = url.searchParams.get("type") || "";
	// 	const response = await fetch(
	// 		`/api/v1/main.json?q=&endpoint=browse${browseId ? `&browseId=${browseId}` : ""}${pt ? `&pt=${pt}` : ""}`,
	// 	);
	// 	const data = await response.json();
	// 	if (!response.ok) {
	// 		return {
	// 			props: {
	// 				status: response.status,
	// 				msg: response.body,
	// 			},
	// 		};
	// 	}

	// 	return {
	// 		props: {
	// 			data: data,
	// 			id: browseId,
	// 		},
	// 		cache: { maxage: 3600 },
	// 		status: 200,
	// 	};
	// };
</script>

<script lang="ts">
	import ListItem from "$lib/components/ListItem/ListItem.svelte";
	import { currentTitle, key } from "$stores/stores";
	import { parsePageContents } from "$lib/parsers/release";
	import { isPagePlaying } from "$stores/stores";
	import list from "$lib/stores/list";
	import InfoBox from "$lib/components/Layouts/InfoBox.svelte";
	import { page } from "$app/stores";
	import Header from "$lib/components/Layouts/Header.svelte";
	import { groupSession } from "$lib/stores";
	import { CTX_ListItem } from "$lib/contexts";
	import type { PageData } from "./$types";
	export let data: PageData;

	let { data: data$1, id, path } = data;

	$: id = $page.url.searchParams.get("id");
	const promise = parsePageContents(data$1);
	let { items, releaseInfo } = promise;
	// $: console.log(items);
	const setId = () => isPagePlaying.add(id);
	const playAlbum = () => {
		setId();
		list.initPlaylistSession({ playlistId: releaseInfo.playlistId });
		list.updatePosition(0);
		currentTitle.set($list.mix[0].title);
	};
	const playGroupSession = () => {
		setId();
		console.log(releaseInfo.playlistId);
		groupSession.setPlaylistMix(releaseInfo.playlistId);
		// currentTitle.set(items[0].title);
	};
	const playRadio = () => {
		setId();

		list.initAutoMixSession({
			videoId: items[0].videoId,
			playlistId: releaseInfo?.autoMixId,
			keyId: 0,
		});
		currentTitle.set(items[0].title);
	};

	$: hasList = $list.mix.length > 0;
	let thumbnail = releaseInfo?.thumbnails[0]?.url.replace(/=(w(\d+))-(h(\d+))/g, "=w512-h512");

	CTX_ListItem.set({ parentPlaylistId: releaseInfo.playlistId, page: "release" });
</script>

<Header
	title={releaseInfo.title}
	desc={`${releaseInfo.title} by ${releaseInfo?.artist?.name || releaseInfo?.artist[0]?.name} on Beatbump`}
	url={path + `?id=${id}`}
	image={thumbnail}
/>
{#await promise then _}
	<main>
		<InfoBox
			{thumbnail}
			buttons={[
				{ text: "Play Album", action: () => playAlbum(), icon: "play" },
				{ text: "Album Radio", action: () => playRadio(), icon: "play" },
			]}
			title={releaseInfo.title}
			artist={releaseInfo.artist}
			subtitles={releaseInfo.subtitles}
			type="release"
		/>
		{#each items as item, index}
			<ListItem
				page="release"
				on:setPageIsPlaying={() => setId()}
				{item}
				idx={index}
				parentPlaylistId={releaseInfo?.playlistId}
			/>
		{/each}
	</main>
{:catch error}
	{error}
{/await}

<!-- markup (zero or more items) goes here -->
<style lang="scss">
</style>
