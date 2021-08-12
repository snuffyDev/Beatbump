<script context="module">
	export async function load({ query, page, fetch }) {
		const browseId = page.query.get('id') || ''
		const pt = page.query.get('type') || ''
		const response = await fetch(
			`/api/main.json?q=&endpoint=browse${
				browseId ? `&browseId=${browseId}` : ''
			}${pt ? `&pt=${pt}` : ''}`
		)
		const data = await response.json()
		if (!response.ok) {
			return {
				props: {
					status: response.statusCode,
					msg: response.statusText
				}
			}
		}

		return {
			props: {
				data: data,
				id: browseId
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import Icon from '$components/Icon/Icon.svelte'
	import ListItem from '$components/ListItem/ListItem.svelte'
	import { currentTitle, theme, key } from '$stores/stores'
	import { parsePageContents } from '$lib/js/releaseUtils'
	import { isPagePlaying } from '$stores/stores'
	import list from '$lib/stores/list'
	import InfoBox from '$lib/components/Layouts/InfoBox.svelte'
	import { browser } from '$app/env'
	import { setContext } from 'svelte'
	import { page } from '$app/stores'
	export let data
	export let id
	$: id = $page.query.get('id')
	const promise = parsePageContents(data)
	let { items, releaseInfo } = promise
	$: if (browser) console.log(promise, releaseInfo)
	const playAlbum = () => {
		list.startPlaylist(releaseInfo.playlistId)
		key.set(0)
		currentTitle.set(items[0].title)
	}
	const playRadio = () => {
		list.initList(items[0].videoId, releaseInfo.autoMixId, 0)
		currentTitle.set(items[0].title)
	}

	$: hasList = $list.mix.length > 0
	const ctx = {}
	setContext(ctx, { pageId: id })
</script>

<svelte:head>
	<title
		>{$currentTitle !== '' || undefined ? 'Album' : $currentTitle} - Beatbump</title>
</svelte:head>

{#await promise then _}
	<main>
		<InfoBox
			thumbnail={releaseInfo.thumbnails[1].url.replace(
				/=(w(\d+))-(h(\d+))/g,
				'=w256-h256'
			)}
			buttons={[
				{ text: 'Play Album', action: () => playAlbum(), icon: 'play' },
				{ text: 'Album Radio', action: () => playRadio(), icon: 'play' }
			]}
			title={releaseInfo.title}
			artist={releaseInfo.artist}
			subtitles={releaseInfo.subtitles}
			type="release" />
		{#each items as item, index}
			<ListItem
				{ctx}
				page="release"
				on:pagePlaying={() => {
					isPagePlaying.set(id)
				}}
				{item}
				{index} />
		{/each}
	</main>
{:catch error}
	{error}
{/await}

<!-- markup (zero or more items) goes here -->
<style lang="scss">
</style>
