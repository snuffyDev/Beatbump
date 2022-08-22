<script lang="ts">
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import { Grid, GridItem } from "$lib/components/Grid";
	import Header from "$lib/components/Layouts/Header.svelte";
	import CarouselItem from "$components/Carousel/CarouselItem.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	let sections = data?.sections;
	let path = data?.path;
	let header = data?.header;
	let type = data?.type;
	$: console.log(data);
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
		{#if type == "grid"}
			<Grid heading={section.title} items={section.section} let:item let:index>
				<CarouselItem
					index
					aspectRatio={item.aspectRatio}
					{item}
					kind="isPlaylist"
					type="home"
					isBrowseEndpoint={true}
					slot="item"
				/>
			</Grid>
		{:else}
			<!-- {@debug section} -->
			<Carousel header={section.header} items={[...section.results]} type="home" isBrowseEndpoint={false} />
		{/if}
	{/each}
</main>

<style lang="scss">
</style>
