<script context="module" lang="ts">
	import { api } from '$lib/api'
	import type { Load } from '@sveltejs/kit'
	export const load: Load = async ({ page, fetch }) => {
		const id = page.query.get('list')
		let body = {
			path: 'playlist',
			endpoint: 'browse',
			type: 'playlist',
			browseId: id,
			playlistId: id
		}

		const res = await api(fetch, { ...body })

		const {
			tracks = [],
			header = {},
			continuations = {},
			data = {}
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
				id: page.query.get('list'),
				key: page.path
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
	import { onMount, setContext } from 'svelte'
	import type { Item } from '$lib/types'

	import InfoBox from '$lib/components/Layouts/InfoBox.svelte'
	import { writable } from 'svelte/store'
	import { browser } from '$app/env'
	import Header from '$lib/components/Layouts/Header.svelte'
	import type { Header as HeaderType } from '$lib/types/playlist'

	export let tracks: Item[]
	export let header: HeaderType = {
		thumbnails: [],
		description: '',
		playlistId: '',
		secondSubtitle: [],
		subtitles: [],
		title: ''
	}
	export let data
	export let id: string
	export let continuations
	export let key
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
	if (browser) {
	}
	$: console.log(
		data,
		tracks,
		continuations,
		header,
		header.thumbnails[1],
		header.thumbnails[1].url
	)

	pageTitle =
		pageTitle.length > 64 ? pageTitle.substring(0, 64) + '...' : header.title
	description =
		header.description.length > 240
			? header.description.substring(0, 240) + '...'
			: header.description
	const getContinuation = async () => {
		if (isLoading || hasData) return
		if (!itct || !ctoken) {
			hasData = true

			return
		}
		try {
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
				// console.log(data.data)
				itct = data.continuations.clickTrackingParams
				trackStore.update((t) => [...t, ...continuationItems])
				isLoading = false
				hasData = data.length === 0
				return hasData
			} else {
				ctoken = null
				itct = undefined

				hasData = null
				isLoading = false
				trackStore.update((t) =>
					[...t, ...continuationItems].filter((item) => {
						if (item !== null || item !== undefined) {
							return item
						}
					})
				)
			}

			// console.log(data, items, continuations, ctoken)

			return !isLoading
		} catch (error) {
			hasData = null
			isLoading = false
		}
	}
	$: items = $trackStore
	let a = []
</script>

<svelte:head>
	<title
		>{$currentTitle !== undefined ? $currentTitle : 'Playlist'} - Beatbump</title
	>
</svelte:head>

<svelte:window bind:innerWidth={width} />
<Header
	title={header?.title}
	url={`${key}?list=${id}`}
	desc={description}
	image={header?.thumbnails[header.thumbnails?.length - 1]?.url}
/>

{#await tracks}
	<!-- promise is pending -->
	Loading
{:then _}
	<!-- promise was fulfilled -->
	<main>
		<InfoBox
			subtitles={header.subtitles}
			secondSubtitle={header.secondSubtitle}
			thumbnail={header.thumbnails[header.thumbnails?.length - 1].url.replace(
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
			{items}
			bind:isLoading
			on:getMore={async () => await getContinuation()}
			bind:hasData
			let:item
			let:index
		>
			<ListItem
				{ctx}
				parentPlaylistId={id.slice(2)}
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
