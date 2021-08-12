<script context="module">
	export async function load({ page, fetch }) {
		const res = await fetch('/api/playlist.json?list=' + page.query.get('list'))
		const { tracks, header, continuations } = await res.json()
		if (!res.ok) {
			return {
				error: new Error(res.statusText),
				status: res.status
			}
		}
		return {
			props: {
				tracks: await tracks,
				continuations: await continuations,
				header: await header,
				id: page.query.get('list')
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import ListItem from '$components/ListItem/ListItem.svelte'

	import list from '$lib/stores/list'
	import { currentTitle, isPagePlaying } from '$lib/stores/stores'
	import type { Header } from '$lib/types/playlist'
	import { onMount, setContext } from 'svelte'
	import type { Item } from '$lib/types'

	import InfoBox from '$lib/components/Layouts/InfoBox.svelte'
	export let tracks: Item[]
	export let header: Header
	export let id
	export let continuations
	let width
	let pageTitle = header?.title
	let description
	$: id = id
	const ctx = {}
	setContext(ctx, { pageId: id })
	// console.log(tracks, continuations, header)

	onMount(() => {
		pageTitle =
			pageTitle.length > 64 ? pageTitle.substring(0, 64) + '...' : header.title
		description =
			header.description.length > 240
				? header.description.substring(0, 240) + '...'
				: header.description
	})
</script>

<svelte:head>
	<title
		>{$currentTitle !== undefined ? $currentTitle : 'Playlist'} - Beatbump</title>
</svelte:head>

<svelte:window bind:innerWidth={width} />
{#await tracks}
	<!-- promise is pending -->
	Loading
{:then _}
	<!-- promise was fulfilled -->
	<main>
		<InfoBox
			subtitles={header.subtitles}
			secondSubtitle={header.secondSubtitle}
			thumbnail={header.thumbnails[0].url.replace(
				/=(w(\d+))-(h(\d+))/g,
				'=w256-h256'
			)}
			title={pageTitle}
			{description}
			buttons={[
				{
					action: () => {
						list.startPlaylist(header.playlistId)
					},
					icon: 'play',
					text: 'Play'
				}
			]} />

		{#each tracks as res, i}
			<ListItem
				{ctx}
				page="playlist"
				on:pagePlaying={() => {
					isPagePlaying.set(id)
				}}
				item={res}
				index={i} />
		{/each}
	</main>
{:catch error}
	{error}
{/await}

<style lang="scss">
</style>
