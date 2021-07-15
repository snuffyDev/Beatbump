<script context="module">
	// import { search } from '$stores/stores'
	export async function load({ page, fetch }) {
		const { slug } = page.params;
		const filter = page.query.get("filter");
		const url =
			`/api/search.json?q=` +
			encodeURIComponent(page.params.slug) +
			`&filter=` +
			encodeURIComponent(page.query.get("filter"));
		const response = await fetch(url);

		let {
			contents,
			continuation,
			correctedQuery,
			error,
		} = await response.json();
		if (response.ok) {
			return {
				props: { filter, contents, continuation, correctedQuery, error },
				maxage: 0,
				status: 200,
			};
		}
	}
</script>

<script lang="ts">
	export let continuation;
	export let contents;
	export let correctedQuery;
	export let error;
	export let filter;
	// $: console.log(slug, filter, `TEST`)
	// $: contents = contents
	// $: console.log(continuation)
	import { currentTitle, search } from "$stores/stores";
	import { page } from "$app/stores";
	import { invalidate } from "$app/navigation";
	import Item from "$components/Item/Item.svelte";
	import { tick } from "svelte";

	(async () => {
		await tick();
		console.log("waited!");
	})();
	$: search.set([...contents]);
	// $:
	let songTitle = $page.params.slug;
	let ctoken = continuation?.continuation;
	let itct = continuation?.clickTrackingParams;
	console.log(filter);
	async function paginate() {
		return await fetch(
			`/api/search.json?q=` +
				`&filter=` +
				filter +
				`&params=${itct}${continuation.continuation ? `&ctoken=${ctoken}` : ""}`
		)
			.then((data) => data.json())
			.then((data) => {
				const res = data;

				search.update((u) => [...u, ...res.contents]);

				if (data?.error) {
					error = data?.error;
				}
				ctoken = res.continuation.continuation;
				itct = res.continuation.clickTrackingParams;
				return { params: itct, continuation: ctoken };
			});
	}
</script>

<svelte:head>
	<title
		>{$currentTitle !== ""
			? `${$currentTitle} - `
			: "Search - "}Beatbump</title>
</svelte:head>
<!-- {JSON.stringify(results)} -->
{#key contents}
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
							invalidate($page.path);
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
				paginate();
			}}>Load More</button>
	{/if}
{/key}

<style scoped lang="scss">
	@import "../../global/scss/components/mixins";
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
