<script context="module">
	import { get } from '$lib/api'

	export async function load({ page, fetch }) {
		const id = page.query.get('id')
		const playlist = page.query.get('list') || undefined
		// const meta = await get('player', { videoId: id })
		// const data = await meta.body
		const metadata = await fetch(
			'/api/player.json?videoId=' + id + '&playlistId='
		)
		const data = await metadata.json()
		if (!id) {
			return { redirect: '/trending', status: 301 }
		}
		return {
			props: {
				data,
				id,
				playlist
			},
			status: 200
		}
	}
</script>

<script>
	import { goto } from '$app/navigation'

	export let id
	export let playlist
	export let data
	import list from '$lib/stores/list'
</script>

<svelte:head>
	<meta property="og:title" content={data.videoDetails.title} />
	<meta property="og:type" content="music.song" />
	<meta property="og:site_name" content="Beatbump" />
	<meta
		property="og:image"
		content={data.videoDetails.thumbnail.thumbnails[1].url} />
	<meta
		property="og:url"
		content={`https://beatbump.ml/listen?id=${id}${
			playlist ? `&list=${playlist}` : ''
		}`} />
	<title>{data.videoDetails.title} | Beatbump</title>
</svelte:head>
<main>
	<div class="modal">
		<div class="modal-header">Listen to {data.videoDetails.title}?</div>
		<button
			on:click={() => {
				list.initList(id, playlist)
				goto('/trending')
			}}>OK</button>
	</div>
</main>

<style lang="scss">
	.modal {
		display: flex;
		flex-direction: column;
		background: #191f2b;
		align-self: center;
		padding: 1rem;
	}
	.modal-header {
		font-size: 1.5rem;
		margin-bottom: 0.8rem;
	}
	main {
		display: flex;
		height: 100%;
		justify-content: center;
	}
</style>
