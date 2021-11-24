<script context="module" lang="ts">
	export const ssr = false
	import type { Load } from '@sveltejs/kit'
	import { onMount, setContext } from 'svelte'
	export const load: Load = async ({ page }) => {
		const playlistName = page.params.slug
		return {
			props: {
				playlistName
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	import InfoBox from '$lib/components/Layouts/InfoBox.svelte'
	import db from '$lib/db'
	import List from './_List.svelte'
	import ListItem from '$lib/components/ListItem/ListItem.svelte'
	import { isPagePlaying, key } from '$lib/stores/stores'
	import list from '$lib/stores/list'
	import { getSrc } from '$lib/utils'
	import Header from '$lib/components/Layouts/Header.svelte'
	import { page } from '$app/stores'
	import CreatePlaylist from '$lib/components/PlaylistPopper/CreatePlaylist.svelte'

	export let playlistName
	const ctx = {}

	setContext(ctx, { pageId: playlistName })
	console.log(playlistName)
	let items = []
	let playlist: {
		items?: any[]
		name?: string
		thumbnail?: string
		description?: string
		length?: string
	}
	let thumbnail
	onMount(async () => {
		const promise: {
			items?: any[]
			name?: string
			thumbnail?: string
			description?: string
		} = await db.getPlaylist(playlistName)
		playlist = { ...promise }
		playlist = playlist
		items = [...playlist.items]
		thumbnail = playlist.thumbnail
		console.log(promise)
	})
	let showEditPlaylist
</script>

<Header desc="Playlist" title="Playlist" url="/library" />
<main>
	{#if showEditPlaylist}
		<CreatePlaylist
			defaults={{
				name: playlist?.name,
				thumbnail: playlist?.thumbnail,
				description: playlist?.description
			}}
			on:close={() => (showEditPlaylist = false)}
			on:cancel={() => (showEditPlaylist = false)}
			on:submit={async ({ detail }) => {
				const promise = await db.updatePlaylist({
					thumbnail: detail?.thumbnail,
					id: $page.params.slug,
					name: detail?.title,
					description: detail?.description
				})
				thumbnail = detail?.thumbnail
				playlist = {
					...playlist,
					thumbnail: detail.thumbnail,
					name: detail.title,
					description: detail?.description
				}
				console.log(promise)
				showEditPlaylist = false
			}}
		/>
	{/if}
	<InfoBox
		thumbnail={playlist?.thumbnail}
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
					key.set(0)

					$list.mix = [...items]
					await getSrc(items[0]?.videoId)
				}
			},
			{
				icon: 'edit',
				text: 'Edit Playlist',
				action: async () => {
					showEditPlaylist = true
				}
			}
		]}
	/>

	<List {items} let:item let:index>
		<ListItem
			{ctx}
			page="library"
			on:initLocalList={async ({ detail }) => {
				$list.mix = [...items]
				await getSrc($list.mix[index]?.videoId)
			}}
			on:pagePlaying={() => {
				isPagePlaying.set(playlistName)
			}}
			{item}
			{index}
		/>
	</List>
</main>

<!-- <h1>WORK IN PROGRESS</h1> -->
<style lang="scss">
</style>
