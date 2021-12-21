<script context="module">
	export async function load({ page, fetch }) {
		const response = await fetch(`/explore/${page.params.slug}.json`)
		const { sections, header, original, type } = await response.json()
		return {
			props: {
				sections,
				header,
				type,
				original
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	import Carousel from '$lib/components/Carousel/Carousel.svelte'
	import { Grid, GridItem } from '$lib/components/Grid'
	export let sections
	export let header
	export let type
	export let original
</script>

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
