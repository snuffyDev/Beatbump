<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	import { onMount, setContext } from 'svelte'
	export const load: Load = async ({ page }) => {
		const playlistName = decodeURIComponent(page.params.slug)
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

	export let playlistName
	const ctx = {}

	setContext(ctx, { pageId: playlistName })

	let items = []
	let playlist
	onMount(async () => {
		const promise = await db.getPlaylist(playlistName)
		playlist = promise
		items = [...playlist.items]
		console.log(promise)
	})
</script>

<Header desc="Playlist" title="Playlist" url="/library" />
<main>
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
