<script lang="ts">
	import InfoBox from "$lib/components/Layouts/InfoBox.svelte";
	import { IDBService } from "$lib/workers/db/service";

	import { page } from "$app/stores";
	import DraggableList from "$lib/components/DraggableList/DraggableList.svelte";
	import Header from "$lib/components/Layouts/Header.svelte";
	import ListInfoBar from "$lib/components/ListInfoBar";
	import CreatePlaylist from "$lib/components/PlaylistPopper/CreatePlaylist.svelte";
	import { getSrc } from "$lib/player";
	import list from "$lib/stores/list";
	import { isPagePlaying } from "$lib/stores/stores";
	import { filter } from "$lib/utils";
	import { onMount, tick } from "svelte";
	import Search from "../_Search.svelte";

	import ListItem, {
		listItemPageContext,
	} from "$components/ListItem/ListItem.svelte";
	import { CTX_ListItem } from "$lib/contexts";
	import type { Item } from "$lib/types";
	import type { IDBPlaylist } from "$lib/workers/db/types";
	export let data;

	const { playlistName } = data;
	CTX_ListItem.set({ page: "library" });

	let items: Item[] = [];
	let playlist: IDBPlaylist = undefined;
	let showEditPlaylist;
	let hasQuery = false;
	async function getPlaylist() {
		const promise = await IDBService.sendMessage(
			"get",
			"playlist",
			playlistName,
		);
		playlist = {};
		console.log(promise);
		Object.assign(playlist, promise);
		// playlist = [...playlist];
		items = [...playlist.items];
	}
	onMount(async () => {
		await getPlaylist();
		return listItemPageContext.add("library");
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
</script>

<Header
	desc="Playlist"
	title="Playlist"
	url="/library"
/>
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
					await IDBService.sendMessage("update", "playlist", {
						thumbnail: detail?.thumbnail,
						id: $page.params.slug,
						name: detail?.title,
						description: detail?.description,
					});
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
			subtitles={[
				playlist?.items?.length,
				playlist?.items?.length > 1 ? "Songs" : "Song",
			]}
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
						// isPagePlaying.add(playlistName);
						// $list.mix = ;
						list.shuffleRandom(items);
						list.updatePosition(0);

						await getSrc($list.mix[0]?.videoId);
					},
				},
				{
					icon: "edit",
					text: "Edit Playlist",
					type: "outlined",
					style: "squared",
					action: async () => {
						showEditPlaylist = true;
					},
				},
			]}
		/>
		<Search
			on:input={({ detail }) => {
				hasQuery = detail.query.length === 0 ? false : true;
				items = filter(
					playlist.items,
					(item) =>
						item.title &&
						item.title.toLocaleLowerCase().includes(detail?.query),
				);
			}}
		/>
		<ListInfoBar />
		<DraggableList
			{items}
			on:dragstart={({ detail }) => dragstart(detail.event, detail.index)}
			on:dragend={async ({ detail }) => {
				const { event, index } = detail;
				if (hasQuery) return;
				drop(event, index);
				await tick();
				await IDBService.sendMessage("update", "playlist", {
					items: [...items],
					id: playlistName,
					hideAlert: true,
				});
			}}
		>
			<ListItem
				draggable
				let:item
				let:index
				on:initLocalPlaylist={async ({ detail }) => {
					!$isPagePlaying.has(playlistName) &&
						(await list.setMix(
							items.map((item) => ({ ...item, IS_LOCAL: true })),
							"local",
						));

					await tick();

					await getSrc($list.mix[detail.idx]?.videoId);
				}}
				on:setPageIsPlaying={async ({ detail }) => {
					isPagePlaying.add(playlistName);
					if ($list.mix.length) {
						await getSrc(
							$list.mix[detail.index]?.videoId,
							undefined,
							undefined,
							true,
						);
					}
				}}
				on:click={async ({ detail }) => {
					if (!$list.mix.length) return;
					await getSrc($list.mix[detail.index]?.videoId);
				}}
				slot="item"
				{item}
				idx={index}
			/>
		</DraggableList>
	</main>
{/if}

<style lang="scss">
</style>
