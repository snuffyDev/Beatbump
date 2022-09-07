<script lang="ts">
	import InfoBox from "$lib/components/Layouts/InfoBox.svelte";
	import { IDBService } from "$lib/workers/db/service";

	import List from "../_List.svelte";
	import { isPagePlaying } from "$lib/stores/stores";
	import list from "$lib/stores/list";
	import { filter, getSrc } from "$lib/utils";
	import Header from "$lib/components/Layouts/Header.svelte";
	import { page } from "$app/stores";
	import CreatePlaylist from "$lib/components/PlaylistPopper/CreatePlaylist.svelte";
	import ListInfoBar from "$lib/components/ListInfoBar";
	import LocalListItem from "$lib/components/ListItem/LocalListItem.svelte";
	import { CTX_ListItem } from "$lib/contexts";
	import Search from "../_Search.svelte";
	import { onMount, tick } from "svelte";

	import type { Item } from "$lib/types";
	import type { IDBPlaylist } from "$lib/workers/db/types";
	export let data;

	const { playlistName } = data;
	CTX_ListItem.set({ page: "library" });

	let items: Item[] = [];
	let playlist: IDBPlaylist = undefined;
	let thumbnail = undefined;
	let showEditPlaylist;
	let hasQuery = false;
	async function getPlaylist() {
		console.log(playlistName);
		const promise = await IDBService.sendMessage("get", "playlist", playlistName);
		console.log(promise);
		playlist = {};
		Object.assign(playlist, promise);
		playlist = playlist;
		console.log(playlist);
		items = playlist.items;
		thumbnail = playlist?.thumbnail;
	}
	onMount(async () => {
		await getPlaylist();
	});
	const drop = async (event, target) => {
		if (hasQuery) return;
		event.dataTransfer.dropEffect = "move";
		const start = parseInt(event.dataTransfer.getData("text/plain"));
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

		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.dropEffect = "move";
		const start = i;
		event.dataTransfer.setData("text/plain", start);
	};
	let hovering: number | boolean = false;
</script>

<Header desc="Playlist" title="Playlist" url="/library" />
{#if playlist !== undefined}
	<main>
		{#if showEditPlaylist}
			<CreatePlaylist
				defaults={{
					name: playlist?.name,
					thumbnail: playlist?.thumbnail,
					description: playlist?.description,
					id: playlist?.id,
				}}
				hasFocus={true}
				isLocalPlaylist={true}
				on:close={() => (showEditPlaylist = false)}
				on:cancel={() => (showEditPlaylist = false)}
				on:submit={async ({ detail }) => {
					const promise = await IDBService.sendMessage("update", "playlist", {
						thumbnail: detail?.thumbnail,
						id: $page.params.slug,
						name: detail?.title,
						description: detail?.description,
					});
					thumbnail = detail?.thumbnail;
					playlist = {
						...playlist,
						thumbnail: detail.thumbnail,
						name: detail.title,
						description: detail?.description,
					};
					showEditPlaylist = false;
				}}
			/>
		{/if}
		<InfoBox
			thumbnail={playlist?.thumbnail}
			description={playlist?.description}
			title={playlist?.name}
			editable={true}
			type="playlist"
			subtitles={[playlist?.items?.length, playlist?.items?.length > 1 ? "Songs" : "Song"]}
			buttons={[
				{
					icon: "play",
					text: "Start Playlist",
					action: async () => {
						list.updatePosition(0);

						list.setMix([...items], "local");
						isPagePlaying.add(playlistName);
						await getSrc(items[0]?.videoId);
					},
				},
				{
					icon: "shuffle",
					text: "Shuffle",

					action: async () => {
						// showEditPlaylist = true;
						isPagePlaying.add(playlistName);
						// $list.mix = ;
						list.shuffleRandom([...items]);

						await getSrc($list.mix[0]?.videoId);
					},
				},
				{
					icon: "edit",
					text: "Edit Playlist",
					type: "outlined",
					action: async () => {
						showEditPlaylist = true;
					},
				},
			]}
		/>
		<Search
			on:input={({ detail }) => {
				hasQuery = detail.query.length === 0 ? false : true;
				items = filter(playlist.items, (item) => item.title && item.title.toLocaleLowerCase().includes(detail?.query));
			}}
		/>
		<ListInfoBar />
		<List {items} let:item let:index let:send let:receive>
			<LocalListItem
				on:hovering={({ detail }) => (hovering = detail?.idx)}
				on:notHovering={() => (hovering = null)}
				on:dragstart={(event) => dragstart(event, index)}
				on:update={async (event) => getPlaylist()}
				on:drop={async (event) => {
					if (hasQuery) return;
					drop(event, index);
					await tick();
					await IDBService.sendMessage("update", "playlist", {
						items: [...items],
						id: playlistName,
						hideAlert: true,
					});
				}}
				on:initLocalList={async ({ detail }) => {
					list.setMix(items);
					await getSrc($list.mix[index]?.videoId);
				}}
				on:pagePlaying={() => {
					isPagePlaying.add(playlistName);
				}}
				{item}
				idx={index}
			/>
		</List>
	</main>
{/if}

<style lang="scss">
</style>
