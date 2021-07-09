<script lang="ts">
	import Loading from '$lib/components/Loading/Loading.svelte'
	import { searchManager } from '$lib/stores/stores'

	import Item from '$lib/components/Item/Item.svelte'
	import { currentTitle, updateTrack, key } from '$lib/stores/stores'
	let loading = true

	import { onMount, tick } from 'svelte'
	import { page } from '$app/stores'
	import * as utils from '$lib/utils'
	import { invalidate } from '$app/navigation'
	$: ctoken = ''
	$: itct = ''
	let error = undefined
	let correctedQuery = undefined
	let q = $page.query.get('q')
	$: filter = $page.query.get('filter')
	let songTitle = q
	$: {
		q
		window.scrollTo(0, 0)
	}
	onMount(async () => {
		loading = true

		let q = $page.query.get('q')

		console.log(ctoken + ` beginning ctoken`)
		songTitle = q
		let res = await utils.searchTracks(songTitle, filter, endpoint, '', ctoken)
		console.log(res)
		if (res.error) {
			error = res.error
			loading = false
			return []
		}
		const data = res.contents
		if (res.didYouMean) {
			correctedQuery = res.term
		}
		ctoken = res.continuation.continuation

		itct = res.continuation.clickTrackingParams

		loading = false
		return { data, ctoken, itct, correctedQuery }
	})
	$: hasList = $searchManager.length > 0
	async function searchCont(error) {
		return await utils
			.searchTracks(q, itct, 'search', '', ctoken, '')
			.then((data) => {
				if (data.error) {
					error = res.error
					loading = false
				}
				// console.log(data)
				ctoken = data.continuation.continuation
				itct = data.continuation.clickTrackingParams
			})

		console.log(ctoken, songIndex)
	}
	$: isLoading = $isLoading
	let endpoint = 'search'
	let id = $key
</script>

<svelte:head>
	<title
		>{$currentTitle !== ''
			? `${$currentTitle} - `
			: 'Search - '}Beatbump</title>
</svelte:head>

{#if loading}
	<Loading />
{:else if error !== undefined}
	<section class="searchHeader">
		<p>
			{error} for <em>'{songTitle}'</em>
		</p>
	</section>
{:else}
	<section class="searchHeader">
		<p>All Results for...</p>
		<em>'{songTitle}'</em>
		{#if correctedQuery}
			<p>
				Did you mean: <em
					class="link"
					on:click={() => {
						invalidate($page.path)
					}}>{correctedQuery}?</em>
			</p>
		{/if}
	</section>
	<main class="parent">
		{#each $searchManager as data (data.hash)}
			<Item {data} />
		{/each}
	</main>
	<button
		class="button--block button--outlined"
		on:click={async () => {
			return await searchCont(error).then(async (data) => {
				// songIndex = [...songIndex, ...data.contents]
			})
		}}>Load More</button>
{/if}

<style scoped lang="scss">
	@import '../../global/scss/components/mixins';
	button {
		margin-bottom: 0.8rem;
	}
	.searchHeader {
		padding: 0rem 1.5rem 0;
		margin-left: auto;
		display: flex;
		flex-direction: column;

		white-space: pre;
		font-size: 1.125rem;
		margin: 0;
		font-weight: 400;
		padding-bottom: 0;
		h5 {
			font-size: 1.95rem;
		}
		em {
			// padding-top: 0.5rem;
			font-size: 0.95em;
		}
	}

	.top {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100%, 1fr));
		gap: 2rem;

		padding: 2rem 2rem 0.5rem 2rem;

		align-items: center;
		justify-content: space-evenly;
		max-width: 100%;
	}
	.item {
		height: auto;
		align-content: center;
		max-height: 5rem;
		.top-container {
			height: auto;
			max-height: 100%;
			min-height: 100%;
			height: auto;
			position: relative;
			top: 0;
			bottom: 0;
			right: 0;
			left: 0;
		}
		&::before {
			@include scrimGradient(#161b20, 'to top');
		}
		display: inline-flex;
		// background: linear-gradient(#2c3441);
		width: auto;
		overflow: hidden;
		flex-direction: row;
		min-height: 100%;
		height: auto;
		background: #1e232c;
		min-width: 100%;
		height: auto;
	}

	.top-details {
		padding-left: 0.25rem;
		display: flex;
		flex-direction: column;
		justify-content: center;

		margin-right: auto;
		margin-left: auto;
		height: auto;
		max-height: inherit;
		max-width: inherit;
		min-height: 32px;
		color: white;
		margin-left: 0.5rem;
		.top-title {
			font-size: 12pt;
		}
	}
	.thumbnail {
		margin: 0;
		width: auto;
		height: auto;
		max-height: inherit;
		aspect-ratio: 1/1;
		img {
			max-height: inherit;
			aspect-ratio: inherit;
			object-fit: scale-down;
		}
	}
	@media (min-width: 640px) {
		.top {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
			gap: 2rem;

			padding: 2rem;

			flex-direction: row;
			flex-wrap: nowrap;
			align-items: center;
			justify-content: space-evenly;
			max-width: 100%;
		}
		.item {
			.top-container {
				display: flex;
				width: 100%;
				flex-direction: row;
				align-items: center;
				@include scrimGradient(#161b20, 'to top');
			}
			display: flex;
			// background: linear-gradient(#2c3441);
			width: auto;
			height: 5rem;
			display: flex;
			border: 1.25pt rgb(2 2 2) solid;
			border-radius: 2%;
			background: #1e232c;
			min-width: 100%;
			.top-details {
				padding-left: 0.25rem;
				margin-right: auto;
				margin-left: auto;

				width: 100%;
			}
			.thumbnail {
				margin: 0;
				width: auto;
				height: 100%;
				aspect-ratio: 1/1;
				img {
					aspect-ratio: inherit;
					object-fit: scale-down;
				}
			}
		}
	}
</style>
