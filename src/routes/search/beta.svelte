<script context="module">
	export async function load({ page, fetch, session, context }) {
		let q = page.query.get('q')
		let filter = page.query.get('filter')
		// console.log(q, filter)
		const res = await fetch(
			`/api/search.json?q=${q ? q : ''}${filter ? `&params=${filter}` : ''}`
		)

		if (res.ok) {
			return {
				props: { result: await res.json() }
			}
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		}
	}
</script>

<script lang="ts">
	export let result
	let { continuation, correctedQuery, contents, error, didYouMean } = result

	import { page } from '$app/stores'
	import { searchManager, searchCtoken } from '$stores/stores'
	import { invalidate } from '$app/navigation'
	import Item from '$components/Item/Item.svelte'
	import Loading from '$components/Loading/Loading.svelte'
	import { searchTracks } from '$lib/utils'
	import { onMount } from 'svelte'

	let filter = $page.query.get('filter')
	$: songTitle = $page.query.get('q')
	searchCtoken.set({
		continuation: continuation.continuation,
		itct: continuation.itct
	})
	let ctoken = $searchCtoken.continuation
	let itct = $searchCtoken.itct
	onMount(() => {
		searchManager.reset()
		searchManager.set([...contents])
	})
	let i
	async function searchCont(error) {
		return await fetch(
			'/api/search.json?q=' +
				`&params=${filter}${ctoken ? `&ctoken=${ctoken}` : ''}${
					i ? `&index=${i}` : ''
				}`
		).then(async (data) => {
			const res = await data.json()
			let itct = res.continuation.clickTrackingParams
			searchManager.update((u) => [...u, ...res.contents])
			console.log(itct, ctoken)
			searchCtoken.set({
				continuation: res.continuation.continuation,
				itct: res.continuation.clickTrackingParams
			})

			if (data?.error) {
				error = data?.error
			}
			// console.log(data)
			ctoken = $searchCtoken.continuation
			itct = $searchCtoken.itct
			return { ctoken, itct }
		})
	}
	$: items = $searchManager
</script>

{#await result}
	<Loading />
{:then _}
	{#if error}
		<section class="searchHeader">
			<p>
				{error} for <em>'{songTitle}'</em>
			</p>
		</section>
	{:else}
		<section class="searchHeader">
			<p>All Results for...</p>
			{#key songTitle}
				<em>'{songTitle}'</em>
			{/key}
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
			{#each items as data (data.hash)}
				<Item {data} />
			{/each}
		</main>
		<button
			class="button--block button--outlined"
			on:click={() => {
				searchCont(error)
			}}>Load More</button>
	{/if}
{/await}

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
</style>
