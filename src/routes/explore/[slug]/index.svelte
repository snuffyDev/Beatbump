<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ page, fetch, stuff }) => {
		const response = await fetch(`/explore/${page.params.slug}.json`);
		const { sections, header, type } = await response.json();

		let path = stuff.page;
		return {
			props: {
				sections,
				header,
				type,
				path
			},
			status: 200
		};
	};
</script>

<script lang="ts">
	import Carousel from '$lib/components/Carousel/Carousel.svelte';
	import { Grid, GridItem } from '$lib/components/Grid';
	import Header from '$lib/components/Layouts/Header.svelte';
	export let sections;
	export let path;
	export let header;
	export let type;
</script>

<Header
	title="{header} Playlists"
	url={path}
	desc="Find the perfect playlist that'll match your mood, or fit any occasion."
/>
<main>
	<div class="header">
		<h1>{header}</h1>
	</div>
	{#each [...sections] as section}
		{#if type == 'grid'}
			<Grid heading={section.title} items={section.section} let:item>
				<GridItem slot="item" {item} />
			</Grid>
		{:else}
			<!-- {@debug section} -->
			<Carousel
				header={section.header}
				items={[...section.results]}
				type="home"
				isBrowseEndpoint={false}
			/>
		{/if}
	{/each}
</main>

<style lang="scss">
</style>
