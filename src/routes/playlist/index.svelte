<script context="module">
	import { api } from '$lib/api'

	export async function load({ page, fetch }) {
		const id = page.query.get('list')
		let body = {
			path: 'playlist',
			endpoint: 'browse',
			type: 'playlist',
			browseId: id,
			playlistId: id
		}

		const res = await api(fetch, { ...body })
		// const res = await fetch('/api/api.json', {
		// 	method: 'POST',
		// 	body: newbody,
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	}
		// })
		// const json = await res.json()
		const {
			tracks,
			header,
			continuations,
			data
			// musicDetailHeaderRenderer
		} = await res.body
		if (!res.ok) {
			return {
				error: new Error(res.body),
				status: res.status
			}
		}
		return {
			props: {
				tracks: tracks,
				data: data,
				continuations: continuations,
				header: header,
				id: page.query.get('list')
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import ListItem from '$components/ListItem/ListItem.svelte'
	import List from './_List.svelte'
	import list from '$lib/stores/list'
	import { currentTitle, isPagePlaying } from '$lib/stores/stores'
	import type { Header } from '$lib/types/playlist'
	import { onMount, setContext } from 'svelte'
	import type { Item } from '$lib/types'

	import InfoBox from '$lib/components/Layouts/InfoBox.svelte'
	import { writable } from 'svelte/store'
	export let tracks: Item[]
	export let header: Header
	export let data
	export let id
	export let continuations
	let ctoken = continuations?.continuation || ''
	let itct = continuations?.clickTrackingParams || ''
	let width
	let pageTitle = header?.title
	let description
	$: id = id
	let isLoading = false
	let hasData = false
	const ctx = {}
	const trackStore = writable([])
	trackStore.set(tracks)
	setContext(ctx, { pageId: id })
	console.log(data, tracks, continuations, header)

	onMount(() => {
		pageTitle =
			pageTitle.length > 64 ? pageTitle.substring(0, 64) + '...' : header.title
		description =
			header.description.length > 240
				? header.description.substring(0, 240) + '...'
				: header.description
	})
	const getContinuation = async () => {
		if (isLoading || hasData) return
		if (!itct || !ctoken) {
			hasData = true
			return
		}
		isLoading = true
		const response = await fetch(
			'/api/playlist.json' +
				'?ref=' +
				id +
				`${ctoken ? `&ctoken=${encodeURIComponent(ctoken)}` : ''}` +
				'&itct=' +
				itct
		)
		const data = await response.json()
		const continuationItems = data.tracks
		if (data.continuations) {
			ctoken = data.continuations.continuation
			console.log(data.data)
			itct = data.continuations.clickTrackingParams
		}
		trackStore.update((t) => [...t, ...continuationItems])
		isLoading = false
		hasData = data.length === 0

		console.log(data, tracks, continuations, ctoken)

		return !isLoading
	}
</script>

<svelte:head>
	<title
		>{$currentTitle !== undefined ? $currentTitle : 'Playlist'} - Beatbump</title
	>
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
				'=w512-h512'
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
			]}
		/>

		<List
			items={$trackStore}
			bind:isLoading
			on:getMore={async () => await getContinuation()}
			bind:hasData
			let:item
			let:index
		>
			<ListItem
				{ctx}
				page="playlist"
				on:pagePlaying={() => {
					isPagePlaying.set(id)
				}}
				{item}
				{index}
			/>
		</List>
	</main>
{:catch error}
	{error}
{/await}

<style lang="scss">
	.list {
		display: block;
		height: 100%;
	}
</style>
