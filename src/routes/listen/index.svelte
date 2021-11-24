<script context="module">
	export async function load({ page, fetch }) {
		const id = page.query.get('id')
		const playlist = page.query.get('list') || undefined
		// const meta = await get('player', { videoId: id })
		// const data = await meta.body

		if (!id) {
			return { redirect: '/trending', status: 301 }
		}
		const metadata = await fetch(
			`/api/player.json?videoId=${id ? id : ''}${
				playlist ? `&playlistId=${playlist}` : ''
			}`
		)
		const data = await metadata.json()
		const {
			videoDetails: {
				title = '',
				videoId = '',
				thumbnail: { thumbnails = [] } = {}
			} = {}
		} = data

		return {
			props: {
				title,
				thumbnails,
				videoId,
				playlist
			},
			status: 200
		}
	}
</script>

<script>
	export let videoId
	export let playlist
	export let thumbnails = []
	export let title
	import { goto } from '$app/navigation'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import list from '$lib/stores/list'
	// $: console.log(videoId, playlist, thumbnails, title)
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:type" content="music.song" />
	<meta property="og:description" content={`Listen to ${title} on Beatbump`} />
	<meta property="og:site_name" content="Beatbump" />
	<meta property="og:image" content={thumbnails[thumbnails.length - 1].url} />

	<meta
		property="og:url"
		content={`https://beatbump.ml/listen?id=${videoId}${
			playlist ? `&list=${playlist}` : ''
		}`}
	/>
	<title>{title} | Beatbump</title>
</svelte:head>
<main>
	<div class="modal">
		<div class="modal-header">
			<div class="image-container">
				<img
					src={thumbnails[thumbnails.length - 1]?.url}
					width={thumbnails[thumbnails.length - 1]?.width}
					height={thumbnails[thumbnails.length - 1]?.height}
					alt={`Thumbnail for ${title}`}
				/>
			</div>
			<span class="h2">Listen to {title}?</span>
		</div>
		<div class="container">
			<button
				on:click={() => {
					list.initList({ videoId, playlistId: playlist })
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

		background: #121018;
		align-self: center;
		padding: 1rem 1.5rem;
		border-radius: $lg-radius;
	}
	.modal-header {
		font-size: 1.5rem;
		font-family: 'Commissioner', sans-serif;
		font-weight: 500;
		letter-spacing: -0.01em;
		// margin-bottom: 0.8rem;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
	}
	.image-container {
		max-width: 100%;
		height: auto;
		max-height: 12rem;
	}
	img {
		width: inherit;
		max-width: inherit;
		max-height: inherit;
		object-fit: cover;
	}
	main {
		display: flex;
		height: 100%;
		justify-content: center;
	}
</style>
