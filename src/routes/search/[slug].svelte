<script context="module">
	// import { search } from '$stores/stores'
	export async function load({ page, fetch }) {
		const { slug } = page.params
		const filter = page.query.get('filter')
		const url =
			`/api/search.json?q=${page.params.slug}` +
			`&params=${page.query.get('filter')}`
		const response = await fetch(url)
		let {
			contents,
			continuation,
			correctedQuery,
			error
		} = await response.json()
		if (response.ok) {
			return {
				props: { filter, contents, continuation, correctedQuery, error }
			}
		}
	}
</script>

<script lang="ts">
	export let continuation
	export let contents
	export let correctedQuery
	export let error
	export let filter
	// $: console.log(slug, filter, `TEST`)
	// $: contents = contents
	// $: console.log(continuation)
	import {
		currentTitle,
		search,
		searchCtoken,
		searchManager
	} from '$stores/stores'
	import { page } from '$app/stores'
	import Loading from '$components/Loading/Loading.svelte'
	import { invalidate } from '$app/navigation'
	import Item from '$components/Item/Item.svelte'
	import { onMount } from 'svelte'
	$: search.set([...contents])
	// $: console.log(contents[1].title)
	$: songTitle = $page.params.slug
	// let { continuation: ctoken, clickTrackingParams: itct } = continuation
	let ctoken = continuation?.continuation
	let itct = continuation?.clickTrackingParams
	async function paginate() {
		return await fetch(
			`/api/search.json?q=` +
				`&params=${continuation.clickTrackingParams}${
					continuation.continuation
						? `&ctoken=${continuation.continuation}`
						: ''
				}`
		)
			.then((data) => data.json())
			.then((data) => {
				const res = data

				search.update((u) => [...u, ...res.contents])
				// searchCtoken.set({
				// 	continuation: res.continuation.continuation,
				// 	itct: res.continuation.clickTrackingParams
				// })

				if (data?.error) {
					error = data?.error
				}
				// console.log(data)
				ctoken = res.continuation.continuation
				itct = res.continuation.clickTrackingParams
				return { params: itct, continuation: ctoken }
			})
	}
	// export let contents
</script>

<svelte:head>
	<title
		>{$currentTitle !== ''
			? `${$currentTitle} - `
			: 'Search - '}Beatbump</title>
</svelte:head>
<!-- {JSON.stringify(results)} -->
{#key results}
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
			{#each $search as data (data.hash)}
				<Item {data} />
			{/each}
		</main>
		<button
			class="button--block button--outlined"
			on:click={() => {
				paginate()
			}}>Load More</button>
	{/if}
{/key}

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
</style>
