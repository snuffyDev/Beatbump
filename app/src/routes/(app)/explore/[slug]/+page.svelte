<script lang="ts">
	import CarouselItem from "$components/Carousel/CarouselItem.svelte";
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import { Grid } from "$lib/components/Grid";
	import Header from "$lib/components/Layouts/Header.svelte";

	export let data;
</script>

<Header
	title="{data.response.header} Playlists"
	url={data.path}
	desc="Find the perfect playlist that'll match your mood, or fit any occasion."
/>
<main>
	<div class="header">
		<h1>{data.response.header}</h1>
	</div>
	{#each data.response.items as item}
		{#if item.type === "grid"}
			<Grid
				heading={item.header.title}
				items={item.items}
				let:item
				let:index
			>
				<CarouselItem
					{index}
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
			<Carousel
				header={item.header}
				items={item.items}
				type="home"
				isBrowseEndpoint={false}
			/>
		{/if}
	{/each}
</main>

<style lang="scss">
</style>
