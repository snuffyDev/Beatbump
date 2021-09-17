<script context="module">
	let path
	export async function load({ context, page, fetch }) {
		const browseId = page.query.get('id') || ''
		const pt = page.query.get('type') || ''
		path = context.page
		const response = await api(fetch, 'main', {
			q: '',
			endpoint: 'browse',
			browseId,
			pt: pt ? pt : ''
		})
		const data = await response.body
		if (!response.ok) {
			return {
				props: {
					status: response.status,
					msg: response.body
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
	import tagStore from '$lib/stores/ogtags'
	import { api } from '$lib/api'
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
	let thumbnail = releaseInfo.thumbnails[1].url.replace(
		/=(w(\d+))-(h(\d+))/g,
		'=w512-h512'
	)
	tagStore.desc(
		`${releaseInfo.title} by ${releaseInfo.artist.name} on Beatbump`
	)
	tagStore.title(releaseInfo.title)
	tagStore.url(path + `?id=${id}`)
	tagStore.image(thumbnail)
	const ctx = {}
	setContext(ctx, { pageId: id })
</script>

<svelte:head>
	{#each Object.entries($tagStore) as [property, content]}
		{#if content}
			{#if ['title', 'description', 'image'].includes(property)}
				<meta name={property} {content} />
			{:else}
				<meta {property} {content} />
			{/if}
		{/if}
	{/each}
	<title>{$currentTitle ? $currentTitle : $tagStore.title} - Beatbump</title>
</svelte:head>
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
				on:pagePlaying={() => {
					isPagePlaying.set(id)
				}}
				{item}
				{index}
			/>
		{/each}
	</main>
{:catch error}
	{error}
{/await}

<!-- markup (zero or more items) goes here -->
<style lang="scss">
</style>
