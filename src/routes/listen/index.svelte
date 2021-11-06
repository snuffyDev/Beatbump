<script context="module">
	export async function load({ page, fetch }) {
		const id = page.query.get('id')
		const playlist = page.query.get('list') || undefined
		// const meta = await get('player', { videoId: id })
		// const data = await meta.body
		const metadata = await fetch(
			'/api/player.json?videoId=' + id + '&playlistId='
		)
		const data = await metadata.json()
		const {
			videoDetails: { title = '', thumbnail: { thumbnails = [] } = {} } = {}
		} = data

		if (!id) {
			return { redirect: '/trending', status: 301 }
		}
		return {
			props: {
				title,
				thumbnails: thumbnails.reverse(),
				id,
				playlist
			},
			status: 200
		}
	}
</script>

<script>
	export let id
	export let playlist
	export let thumbnails
	export let title
	import { goto } from '$app/navigation'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import list from '$lib/stores/list'
	// $: console.log(data)
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:type" content="music.song" />
	<meta property="og:description" content={`Listen to ${title} on Beatbump`} />
	<meta property="og:site_name" content="Beatbump" />
	<meta property="og:image" content={thumbnails[0].url} />

	<meta
		property="og:url"
		content={`https://beatbump.ml/listen?id=${id}${
			playlist ? `&list=${playlist}` : ''
		}`}
	/>
	<title>{title} | Beatbump</title>
</svelte:head>
<main>
	<div class="modal">
		<div class="modal-header">Listen to {title}?</div>
		<div class="container">
			<button
				on:click={() => {
					list.initList(id, playlist)
					goto('/trending')
				}}
				><Icon name="play" size="1.25em" color="black" /><span class="text"
					>Start Listening</span
				></button
			>
		</div>
	</div>
</main>

<style lang="scss">
	.container {
		place-items: center;
	}
	.modal {
		display: flex;
		flex-direction: column;
		background: #1c1d26;
		align-self: center;
		padding: 1rem 1.5rem;
		border-radius: var(--lg-radius);
	}
	.modal-header {
		font-size: 1.5rem;
		font-family: 'Commissioner', sans-serif;
		font-weight: 500;
		letter-spacing: -0.01em;
		margin-bottom: 0.8rem;
	}

	main {
		display: flex;
		height: 100%;
		justify-content: center;
	}
</style>
