<script lang="ts">
	import ListItem from "$lib/components/ListItem/ListItem.svelte";
	import { parsePageContents } from "$lib/parsers/release";
	import { isPagePlaying } from "$stores/stores";
	import list from "$lib/stores/list";
	import InfoBox from "$lib/components/Layouts/InfoBox.svelte";
	import { page } from "$app/stores";
	import Header from "$lib/components/Layouts/Header.svelte";
	import { groupSession } from "$lib/stores";
	import { CTX_ListItem, releasePageContext } from "$lib/contexts";
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
		list.initPlaylistSession({ playlistId: releaseInfo.playlistId, index: 0 });
		list.updatePosition(0);
	};
	const playGroupSession = () => {
		setId();
		console.log(releaseInfo.playlistId);
		groupSession.setPlaylistMix(releaseInfo.playlistId);
		// currentTitle.set(items[0].title);
	};
	const playShuffle = () => {
		setId();

		list.initPlaylistSession({
			playlistId: `RDAMPL${releaseInfo?.playlistId}`,
			index: 0,
		});
	};
	const playRadio = () => {
		setId();

		list.initPlaylistSession({ playlistId: releaseInfo?.autoMixId, params: "wAEB", index: 0 });
	};

	let thumbnail = releaseInfo?.thumbnails[0]?.url.replace(/=(w(\d+))-(h(\d+))/g, "=w512-h512");

	CTX_ListItem.set({ parentPlaylistId: releaseInfo.playlistId, page: "release" });
	releasePageContext.set({ page: "release" });
</script>

<Header
	title={releaseInfo.title}
	desc={`${releaseInfo.title} by ${releaseInfo?.artist[0]?.name} on Beatbump`}
	url={path + `?id=${id}`}
	image={thumbnail}
/>
<main data-testid="release">
	<InfoBox
		{thumbnail}
		buttons={[
			{ text: "Play Album", action: () => playAlbum(), icon: "play" },
			{ text: "Album Radio", action: () => playRadio(), icon: "play" },
			{ icon: "dots", type: "icon" },
		]}
		title={releaseInfo.title}
		artist={releaseInfo.artist}
		subtitles={releaseInfo.subtitles}
		type="release"
		on:shuffle={playShuffle}
	/>
	{#each items as item, index}
		<ListItem
			on:setPageIsPlaying={() => setId()}
			{item}
			idx={index}
		/>
	{/each}
</main>

<!-- markup (zero or more items) goes here -->
<style lang="scss">
</style>
