<script lang="ts">
	import { page } from "$app/stores";
	import Header from "$lib/components/Layouts/Header.svelte";
	import InfoBox from "$lib/components/Layouts/InfoBox.svelte";
	import ListItem, {
		listItemPageContext,
	} from "$lib/components/ListItem/ListItem.svelte";
	import { CTX_ListItem, releasePageContext } from "$lib/contexts";
	import list from "$lib/stores/list";
	import { isPagePlaying } from "$stores/stores";
	import { onMount } from "svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	let { items: pageItems, id, path } = data;

	$: id = $page.url.searchParams.get("id");

	let { items, releaseInfo } = pageItems;
	$: console.log(data);
	let thumbnail = releaseInfo?.thumbnails[0]?.url.replace(
		/=(w(\d+))-(h(\d+))/g,
		"=w512-h512",
	);

	const setId = () => isPagePlaying.add(id);

	const playAlbum = () => {
		setId();
		list.initPlaylistSession({ playlistId: releaseInfo.playlistId, index: 0 });
		list.updatePosition(0);
	};

	const playShuffle = () => {
		setId();

		list.initPlaylistSession({
			playlistId: `${releaseInfo?.playlistId}`,
			index: 0,
			params: "wAEB8gECGAE%3D",
		});
	};

	const playRadio = () => {
		setId();

		list.initPlaylistSession({
			playlistId: releaseInfo?.autoMixId,
			params: "wAEB",
			index: 0,
		});
	};

	onMount(() => {
		const release = listItemPageContext.add("playlist");
		return release;
	});

	CTX_ListItem.set({
		parentPlaylistId: releaseInfo.playlistId,
		page: "release",
	});
	releasePageContext.set({ page: "release" });
	$: console.log(releaseInfo, items);
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
			{
				text: "Album Radio",
				type: "outlined",
				action: () => playRadio(),
				icon: "play",
			},
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
