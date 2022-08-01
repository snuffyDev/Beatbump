<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";
	export const load: Load = async ({ fetch, url }) => {
		let browseId = url.searchParams.get("browseId");
		let params = url.searchParams.get("params");
		let itct = url.searchParams.get("itct");
		let visitorData = url.searchParams.get("visitorData");
		const response = await fetch(
			`/artist/releases.json?browseId=${browseId}&visitorData=${visitorData}&params=${params}&itct=${encodeURIComponent(
				itct,
			)}`,
		);
		if (!response.ok) {
			return { props: { status: await response.json() }, status: 200 };
		}
		const data = await response.json();
		const { header, contents, json } = data;
		return {
			props: {
				header: await header,
				contents: await contents,
				json,
			},
			status: 200,
		};
	};
</script>

<script lang="ts">
	import { GridItem, Grid } from "$lib/components/Grid";

	export let header;
	export let contents = [];
	export let status;
	export let json;
	// $: console.log(json, header, contents);
</script>

<main>
	{#if status}
		{status}
	{:else}
		<h1>{header?.artist}</h1>

		<Grid heading={header?.type} let:item items={[...contents]}>
			<GridItem slot="item" {item} />
		</Grid>
	{/if}
</main>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
	}
</style>
