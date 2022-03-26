<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";
	export const load: Load = async ({ fetch, url }) => {
		let browseId = url.searchParams.get("browseId");
		let params = url.searchParams.get("params");
		let itct = url.searchParams.get("itct");
		const response = await fetch(
			`/artist/releases.json?browseId=${encodeURIComponent(
				browseId
			)}&params=${params}&itct=${itct}`
		);
		if (!response.ok) {
			return { props: { status: await response.json() }, status: 200 };
		}
		const { header, contents } = await response.json();
		return {
			props: {
				header: await header,
				contents: await contents
			},
			status: 200
		};
	};
</script>

<script lang="ts">
	import { GridItem, Grid } from "$lib/components/Grid";

	export let header;
	export let contents = [];
	export let status;
	// $: console.log(header, contents)
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
