<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";

	let path;
	export const load: Load = async ({ url, params, fetch, stuff }) => {
		const slug = params.slug;
		const filter = url.searchParams.get("filter") || "";
		path = stuff.page;
		// console.log(filter, page, slug)
		const apiUrl = `/api/search.json?q=${encodeURIComponent(slug)}${
			filter !== "" ? `&filter=${encodeURIComponent(filter)}` : ""
		}`;
		const response = await fetch(apiUrl);
		const data = await response.json();
		const { results = [], continuation = {}, didYouMean, error } = await data;

		if (response.ok) {
			return {
				props: {
					filter: filter,
					contents: results,
					continuation: continuation,
					didYouMean: didYouMean,
					error,
				},
				status: 200,
			};
		}
	};
</script>

<script lang="ts">
	export let continuation: NextContinuationData;
	export let contents;
	export let didYouMean;
	export let error;
	export let filter;

	import { page } from "$app/stores";
	import { invalidate } from "$app/navigation";
	import Listing from "$components/Item/Listing.svelte";
	import type { Item, NextContinuationData } from "$lib/types";
	import VirtualList from "$lib/components/SearchList/VirtualList.svelte";

	import Header from "$lib/components/Layouts/Header.svelte";

	import { writable } from "svelte/store";
	const search = writable<Array<Item>>();
	$: !error && search.set(contents);
	// $: console.log(contents);
	let title;
	let songTitle = title || $page.params.slug;
	title = songTitle;
	let ctoken = continuation.continuation;
	let itct = continuation.clickTrackingParams;
	let isLoading = false;
	let hasData = false;

	async function paginate() {
		if (isLoading || hasData) return;
		try {
			isLoading = true;
			const response = await fetch(
				`/api/search.json?q=` +
					`&filter=` +
					filter +
					`&itct=${itct}${continuation.continuation ? `&ctoken=${ctoken}` : ""}`,
			);
			const newPage = await response.json();
			const res = await newPage;

			if (newPage?.error) {
				error = newPage?.error;
			}
			if (res.continuation.continuation) {
				ctoken = res.continuation.continuation;
				itct = res.continuation.clickTrackingParams;
				search.update((u) => [...u, ...res.results]);
				isLoading = false;
				hasData = newPage.length === 0;
				return hasData;
			}
			return !isLoading;
		} catch (error) {
			hasData = null;
			isLoading = false;
			return {
				error: new Error(error + " Unable to get more!"),
			};
		}
	}
	let items;
	$: !error && (items = $search);
	// $: console.log(items)
</script>

<!-- {JSON.stringify(results)} -->
<Header title="Search" desc={`Search results for ${decodeURIComponent(songTitle)}`} url={path + `?filter=${filter}`} />
<main class="parent">
	{#if error}
		<section class="searchHeader">
			<p>
				{error} for <em>'{decodeURIComponent(songTitle)}'</em>
			</p>
		</section>
	{:else}
		<section class="searchHeader">
			<div class="text">
				<p>All Results for...</p>
				{#key songTitle}
					<em>'{decodeURIComponent(songTitle)}'</em>
				{/key}
				{#if didYouMean}
					<p>
						Did you mean: <em class="link"
							><a
								sveltekit:prefetch
								on:click={() => {
									invalidate(`/search/${$page.url.pathname}?filter=${$page.url.searchParams.get("filter")}`);
								}}
								href={`/search/${didYouMean.term}?filter=${didYouMean.endpoint.params}`}>{didYouMean.term}?</a
							></em
						>
					</p>
				{/if}
			</div>
		</section>
		<VirtualList
			on:endList={() => {
				paginate();
			}}
			bind:isLoading
			bind:hasData
			height=" calc(100% - 6rem)"
			{items}
			let:item
		>
			<Listing data={item} />
		</VirtualList>
	{/if}
</main>

<style scoped lang="scss">
	.parent {
		width: 100%;
		height: 100%;
	}
	@media (min-width: 640px) {
		.l-container {
			overflow-x: hidden;
		}
		.parent {
			width: calc(100% - 40px);
		}
	}
	main {
		padding-top: 0;
		padding-bottom: 0 !important;
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
		padding: 0.8rem 0 0.8rem 0;
		font-family: "CommissionerVariable", sans-serif;
		margin-left: auto;
		display: flex;
		// flex-direction: row;

		// white-space: pre;
		font-size: 1em;
		margin: 0;
		// font-weight: 500;
		.text {
			display: flex;
			flex-direction: column;
			line-height: 2.5;
		}
		h5 {
			font-size: $size-3;
		}
		p {
			font-size: $size-1;
		}
		em {
			font-size: 1.1em;
		}
	}
</style>
