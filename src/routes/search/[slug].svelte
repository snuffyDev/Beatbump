<script context="module">
	export async function load({ page, fetch }) {
		const slug = page.params.slug
		const filter = page.query.get('filter')
		// console.log(filter, page, slug)
		const url =
			`/api/search.json?q=` +
			encodeURIComponent(slug) +
			`&filter=` +
			encodeURIComponent(filter)
		const response = await fetch(url)
		const data = await response.json()
		const {
			contents = {},
			continuation = {},
			didYouMean,
			error = {}
		} = await data
		if (response.ok) {
			return {
				props: {
					filter: filter,
					contents: contents,
					continuation: continuation,
					didYouMean: didYouMean
				},
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	export let continuation: NextContinuationData
	export let contents
	export let didYouMean
	export let error
	export let filter

	// $: console.log(contents, continuation)
	import { currentTitle, search } from '$stores/stores'
	import { page } from '$app/stores'
	import { invalidate } from '$app/navigation'
	import Item from '$components/Item/Item.svelte'
	import type { NextContinuationData, Song } from '$lib/types'
	import VirtualList from '$lib/components/SearchList/VirtualList.svelte'
	import { onMount } from 'svelte'

	$: search.set(contents)

	$: songTitle = $page.params.slug || title
	const title = songTitle
	let ctoken = continuation.continuation
	let itct = continuation.clickTrackingParams
	// console.log(contents);
	let isLoading = false
	let hasData = false
	onMount(() => {
		if (contents) {
		}
		return
	})
	async function paginate() {
		if (isLoading || hasData) return
		try {
			isLoading = true
			const response = await fetch(
				`/api/search.json?q=` +
					`&filter=` +
					filter +
					`&params=${itct}${
						continuation.continuation ? `&ctoken=${ctoken}` : ''
					}`
			)
			const newPage = await response.json()
			const res = await newPage

			if (newPage?.error) {
				error = newPage?.error
			}
			if (res.continuation.continuation) {
				ctoken = res.continuation.continuation
				itct = res.continuation.clickTrackingParams
				search.update((u) => [...u, ...res.contents])
				isLoading = false
				hasData = newPage.length === 0
				return hasData
			}
			return !isLoading
		} catch (error) {
			hasData = null
			isLoading = false
			return {
				error: new Error(error + ' Unable to get more!')
			}
		}
	}
	$: items = $search
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
	<main class="parent">
		<section class="searchHeader">
			<div class="text">
				<p>All Results for...</p>
				{#key songTitle}
					<em>'{songTitle}'</em>
				{/key}
				{#if didYouMean}
					<p>
						Did you mean: <em class="link"
							><a
								on:click={() => {
									invalidate(
										`/search/${$page.path}?filter=${$page.query.get('filter')}`
									)
								}}
								href={`/search/${didYouMean.term}?filter=${didYouMean.endpoint.params}`}
								>{didYouMean.term}?</a
							></em>
					</p>
				{/if}
			</div>
		</section>
		<VirtualList
			on:endList={() => {
				paginate()
			}}
			bind:isLoading
			bind:hasData
			height=" calc(100% - 8.3rem)"
			{items}
			let:item>
			<Item data={item} />
		</VirtualList>
	</main>
{/if}

<style scoped lang="scss">
	@import '../../global/scss/components/mixins';

	.select {
		color: white;
		display: grid;
		grid-template-columns: 1fr 0.1em;
		color: #fff;
		display: grid;
		grid-template-areas: selext;
		/* grid-area: select; */
		align-content: center;
		font-size: 0.95rem;
		grid-template-areas: 'select';
		/* position: relative; */
		/* overflow: visible; */
		width: 100%;
		min-width: 8ch;
		max-width: 16ch;
		&::after {
			grid-area: select;
			content: '';
			justify-self: end;
			align-self: center;
			margin-right: 0.7rem;
			width: 0.6rem;
			height: 0.5rem;
			color: inherit;
			background-color: currentColor;
			-webkit-clip-path: polygon(100% 0, 0 0, 50% 100%);
			clip-path: polygon(100% 0, 0 0, 50% 100%);
		}
	}
	select {
		outline: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		min-width: 5ch;
		/* max-width: 25ch; */
		background-color: transparent;
		border: 1px solid hsla(0, 0%, 66.7%, 0.5);
		padding: 0.2rem 2rem 0.5rem 0.5rem;
		margin: 0;
		width: 100%;
		font-family: inherit;
		font-size: inherit;
		white-space: pre;
		cursor: inherit;
		position: relative;
		grid-area: select;
		align-content: center;
	}

	.filters {
		margin-left: 1.5rem;
		display: flex;
		flex-direction: column;
		padding-block: 1em;
		font-size: inherit;
		line-height: inherit;
		label {
			margin-bottom: 0.8rem;
		}
	}
	main {
		padding: 0 1rem;
	}
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
		padding: 0.5rem 0 0.8rem 0;
		font-family: 'Commissioner', sans-serif;
		margin-left: auto;
		display: flex;
		// flex-direction: row;

		// white-space: pre;
		font-size: 1.125rem;
		margin: 0;
		// font-weight: 500;
		// line-height: 1.5;
		.text {
			display: flex;
			flex-direction: column;
		}
		h5 {
			font-size: 1.95rem;
		}
		p {
			font-size: calc(var(--base-font-size) * 1.1);
		}
		em {
			padding-top: 0.5rem;
			font-size: 1.1em;
			margin-bottom: 0.5rem;
		}
	}
</style>
