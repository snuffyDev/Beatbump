<script lang="ts">
	import type { PageData } from "./$types";

	import { page } from "$app/stores";
	import { afterNavigate, goto, invalidate } from "$app/navigation";
	import Listing from "$components/Item/Listing.svelte";
	import type { Item, NextContinuationData } from "$lib/types";
	import VirtualList from "$lib/components/SearchList/VirtualList.svelte";

	import Header from "$lib/components/Layouts/Header.svelte";

	import { writable } from "svelte/store";
	import type { MusicShelf } from "$lib/types/musicShelf";

	export let data: PageData;
	$: data = data;
	let { results, continuation, filter } = data;
	$: filter = filter;
	$: results = results;
	const search = writable<Item[]>();
	$: results && filter !== "all" && search.set(results[0].contents);
	let ctoken = continuation?.continuation;
	let itct = continuation?.clickTrackingParams;
	let isLoading = false;
	let hasData = false;

	async function paginate() {
		if (isLoading || hasData) return;
		try {
			isLoading = true;
			const response = await fetch(
				`/api/v1/search.json?q=` + `&filter=` + filter + `&itct=${itct}${ctoken ? `&ctoken=${ctoken}` : ""}`,
			);
			const newPage = await response.json();
			const res: PageData = await newPage;

			if (res.continuation.continuation) {
				ctoken = res.continuation.continuation;
				itct = res.continuation.clickTrackingParams;
				search.update((u) => [...u, ...(res.results as unknown as Item[])]);
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
	// $: console.log(results);
	afterNavigate(async ({ from, to }) => {
		if (to.url.pathname.includes("/search")) {
			results = data.results;
			filter = data.filter;
			ctoken = data?.continuation?.continuation;
			itct = data?.continuation?.clickTrackingParams;
			// await invalidate();
		}
	});
</script>

<Header title="Search" desc={`Search results for ${decodeURIComponent($page.params.slug)}`} url={$page.url.pathname} />

<main class="parent" class:max-height={filter !== "all"}>
	{#key data}
		{#each results as result}
			<div class="container music-shelf resp-content-width" class:max-height={filter !== "all"}>
				<span class="h3">{result.header.title}</span>
				{#if filter !== "all"}
					<div class="music-shelf-list">
						<VirtualList
							on:endList={() => {
								queueMicrotask(paginate);
							}}
							bind:isLoading
							bind:hasData
							height="calc(100% - 2.75em)"
							items={$search}
							let:item
						>
							<Listing data={item} />
						</VirtualList>
					</div>
				{:else}
					<div class="music-shelf-list">
						{#each result.contents as item}
							<Listing data={item} />
						{/each}
					</div>
					{#if result.contents.length !== 1}
						<div class="show-more">
							<a
								href={`${$page.params.slug}?filter=${result.header.title.replace(/\s/g, "_").toLowerCase()}`}
								class="link secondary">Show All</a
							>
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	{/key}
</main>

<style lang="scss">
	.h3 {
		font-weight: 600;
	}
	.max-height {
		height: 100%;
	}
	.music-shelf {
		margin-bottom: 3.333em;
		margin-top: 0.666em;
		max-height: 100%;
		display: flex;
	}
	.music-shelf-list {
		max-height: 100%;
		height: 100%;

		margin-bottom: 1.333em;
	}
	.link {
		text-transform: uppercase;
	}
</style>
