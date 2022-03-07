<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	let path;
	export const load: Load = async ({ stuff, url, fetch }) => {
		path = stuff.page;
		const browseId = url.searchParams.get('id') || '';
		const pt = url.searchParams.get('type') || '';
		const response = await fetch(
			`/api/main.json?q=&endpoint=browse${
				browseId ? `&browseId=${browseId}` : ''
			}${pt ? `&pt=${pt}` : ''}`
		);
		const data = await response.json();
		if (!response.ok) {
			return {
				props: {
					status: response.status,
					msg: response.body
				}
			};
		}

		return {
			props: {
				data: data,
				id: browseId
			},
			maxage: 3600,
			status: 200
		};
	};
</script>

<script lang="ts">
	import ListItem from '$components/ListItem/ListItem.svelte';
	import { currentTitle, key } from '$stores/stores';
	import { parsePageContents } from '$lib/js/releaseUtils';
	import { isPagePlaying } from '$stores/stores';
	import list from '$lib/stores/list';
	import InfoBox from '$lib/components/Layouts/InfoBox.svelte';
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import tagStore from '$lib/stores/ogtags';
	import { api } from '$lib/api';
	import Header from '$lib/components/Layouts/Header.svelte';
	export let data;
	export let id;
	$: id = $page.url.searchParams.get('id');
	console.log(data);
	const promise = parsePageContents(data);
	let { items, releaseInfo } = promise;
	// $: console.log(releaseInfo, items, $page)
	const setId = () => isPagePlaying.set(id);
	const playAlbum = () => {
		setId();
		list.startPlaylist(releaseInfo.playlistId);
		key.set(0);
		currentTitle.set(items[0].title);
	};
	const playRadio = () => {
		setId();

		list.initList({
			videoId: items[0].videoId,
			playlistId: releaseInfo?.autoMixId,
			keyId: 0
		});
		currentTitle.set(items[0].title);
	};

	$: hasList = $list.mix.length > 0;
	let thumbnail = releaseInfo?.thumbnails[0]?.url.replace(
		/=(w(\d+))-(h(\d+))/g,
		'=w512-h512'
	);

	const ctx = {};
	setContext(ctx, { pageId: id });
</script>

<Header
	title={releaseInfo.title}
	desc={`${releaseInfo.title} by ${releaseInfo.artist.name} on Beatbump`}
	url={path + `?id=${id}`}
	image={thumbnail}
/>
{#await promise then _}
	<main>
		<InfoBox
			{thumbnail}
			buttons={[
				{ text: 'Play Album', action: () => playAlbum(), icon: 'play' },
				{ text: 'Album Radio', action: () => playRadio(), icon: 'play' }
			]}
			title={releaseInfo.title}
			artist={releaseInfo.artist}
			subtitles={releaseInfo.subtitles}
			type="release"
		/>
		{#each items as item, index}
			<ListItem
				{ctx}
				page="release"
				on:pagePlaying={() => setId()}
				{item}
				{index}
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
