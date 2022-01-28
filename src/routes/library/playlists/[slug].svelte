<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import { onMount, setContext, tick } from 'svelte';
	export const load: Load = async ({ params }) => {
		const playlistName = params.slug;
		return {
			props: {
				playlistName
			},
			status: 200
		};
	};
</script>

<script lang="ts">
	import InfoBox from '$lib/components/Layouts/InfoBox.svelte';
	import db from '$lib/db';
	import List from './_List.svelte';
	import ListItem from './_ListItem.svelte';
	import { isPagePlaying, key } from '$lib/stores/stores';
	import list from '$lib/stores/list';
	import { getSrc } from '$lib/utils';
	import Header from '$lib/components/Layouts/Header.svelte';
	import { page } from '$app/stores';
	import CreatePlaylist from '$lib/components/PlaylistPopper/CreatePlaylist.svelte';
	import ListInfoBar from '$lib/components/ListInfoBar';

	export let playlistName;
	const ctx = {};

	setContext(ctx, { pageId: playlistName });
	// console.log(playlistName)
	let items = [];
	let playlist: {
		items?: any[];
		name?: string;
		thumbnail?: string;
		description?: string;
		length?: string;
		id?: string;
	} = {};
	let thumbnail = undefined;
	let showEditPlaylist;
	async function getPlaylist() {
		const promise: {
			items?: any[];
			name?: string;
			thumbnail?: string;
			description?: string;
		} = await db.getPlaylist(playlistName);
		playlist = { ...promise };
		playlist = playlist;
		items = [...playlist.items];
		thumbnail = playlist.thumbnail;
	}
	onMount(async () => {
		getPlaylist();
		console.log(playlist);
	});
	const drop = async (event, target) => {
		event.dataTransfer.dropEffect = 'move';
		const start = parseInt(event.dataTransfer.getData('text/plain'));
		const newTracklist = items;

		if (start < target) {
			newTracklist.splice(target + 1, 0, newTracklist[start]);
			newTracklist.splice(start, 1);
		} else {
			newTracklist.splice(target, 0, newTracklist[start]);
			newTracklist.splice(start + 1, 1);
		}
		items = newTracklist;
	};
	const dragstart = (event, i) => {
		// console.log(event, i)

		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const start = i;
		event.dataTransfer.setData('text/plain', start);
	};
	let hovering: number | boolean = false;
</script>

<Header desc="Playlist" title="Playlist" url="/library" />
<main>
	{#if showEditPlaylist}
		<CreatePlaylist
			defaults={{
				name: playlist?.name,
				thumbnail: playlist?.thumbnail,
				description: playlist?.description,
				id: playlist?.id
			}}
			hasFocus={true}
			isLocalPlaylist={true}
			on:close={() => (showEditPlaylist = false)}
			on:cancel={() => (showEditPlaylist = false)}
			on:submit={async ({ detail }) => {
				const promise = await db.updatePlaylist({
					thumbnail: detail?.thumbnail,
					id: $page.params.slug,
					name: detail?.title,
					description: detail?.description
				});
				thumbnail = detail?.thumbnail;
				playlist = {
					...playlist,
					thumbnail: detail.thumbnail,
					name: detail.title,
					description: detail?.description
				};
				showEditPlaylist = false;
			}}
		/>
	{/if}
	<InfoBox
		thumbnail={playlist.thumbnail}
		description={playlist?.description}
		title={playlist?.name}
		editable={true}
		type="playlist"
		subtitles={[playlist?.length, playlist?.length > 1 ? 'Songs' : 'Song']}
		buttons={[
			{
				icon: 'play',
				text: 'Start Playlist',
				action: async () => {
					key.set(0);

					$list.mix = [...items];
					await getSrc(items[0]?.videoId);
				}
			},
			{
				icon: 'edit',
				text: 'Edit Playlist',
				action: async () => {
					showEditPlaylist = true;
				}
			}
		]}
	/>
	<ListInfoBar />
	<List {items} let:item let:index let:send let:receive>
		<ListItem
			{ctx}
			{send}
			{receive}
			page="library"
			dragTargetIndex={hovering}
			parentPlaylistId={playlist.id}
			on:hovering={({ detail }) => (hovering = detail)}
			on:notHovering={({ detail }) => (hovering = null)}
			on:dragstart={(event) => dragstart(event, index)}
			on:update={async (event) => getPlaylist()}
			on:drop={async (event) => {
				drop(event, index);
				await tick();
				await db.updatePlaylist({
					items: [...items],
					id: playlistName,
					hideAlert: true
				});
			}}
			on:initLocalList={async ({ detail }) => {
				$list.mix = [...items];
				await getSrc($list.mix[index]?.videoId);
			}}
			on:pagePlaying={() => {
				isPagePlaying.set(playlistName);
			}}
			{item}
			{index}
		/>
	</List>
</main>

<!-- <h1>WORK IN PROGRESS</h1> -->
<style lang="scss">
</style>
