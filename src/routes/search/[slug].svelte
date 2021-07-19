<script context="module">
	// import { search } from '$stores/stores'
	export async function load({ page, fetch }) {
		const { slug } = page.params
		const filter = page.query.get('filter')
		const url =
			`/api/search.json?q=` +
			encodeURIComponent(page.params.slug) +
			`&filter=` +
			encodeURIComponent(page.query.get('filter'))
		const response = await fetch(url)
		let data = await response.json()
		let { contents, continuation, didYouMean, error } = await data
		if (response.ok) {
			return {
				props: {
					filter: await filter,
					contents: await contents,
					continuation: await continuation,
					didYouMean: await didYouMean
				},
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	export let continuation
	export let contents
	export let didYouMean
	export let error
	export let filter

	$: console.log(contents, continuation)
	import { currentTitle, search } from '$stores/stores'
	import { page } from '$app/stores'
	import { invalidate } from '$app/navigation'
	import Item from '$components/Item/Item.svelte'
	import { tick } from 'svelte'

	$: search.set(contents)
	// $:
	$: songTitle = $page.params.slug
	let ctoken = continuation?.continuation
	let itct = continuation?.clickTrackingParams
	// console.log(contents);
	async function paginate() {
		return await fetch(
			`/api/search.json?q=` +
				`&filter=` +
				filter +
				`&params=${itct}${continuation.continuation ? `&ctoken=${ctoken}` : ''}`
		)
			.then((data) => data.json())
			.then((data) => {
				const res = data

				search.update((u) => [...u, ...res.contents])

				if (data?.error) {
					error = data?.error
				}
				ctoken = res.continuation.continuation
				itct = res.continuation.clickTrackingParams
				return { params: itct, continuation: ctoken }
			})
	}
</script>

<svelte:head>
	<title
		>{$currentTitle === undefined
			? 'Search - '
			: `${$currentTitle} - `}Beatbump</title>
</svelte:head>
<!-- {JSON.stringify(results)} -->
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
		{#if didYouMean}
			<p>
				Did you mean: <em
					class="link"
					on:click={() => {
						invalidate($page.path)
					}}>{JSON.stringify(didYouMean)}?</em>
			</p>
		{/if}
	</section>
	<main class="parent">
		{#each $search as data (data.hash)}
			<Item {data} />
		{/each}
	</main>
	{#if continuation}
		<button
			class="button--block button--outlined"
			on:click={() => {
				paginate()
			}}>Load More</button>
	{:else}
		<div class="end">
			<h5><em>End of results!</em></h5>
		</div>
	{/if}
{/if}

<style scoped lang="scss">
	@import '../../global/scss/components/mixins';
	.end {
		position: relative;
		display: flex;
		justify-content: center;
		padding: 1.5rem 0;
		overflow: hidden;
		margin: 0;
		h5,
		em {
			margin: 0;
		}
	}
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
