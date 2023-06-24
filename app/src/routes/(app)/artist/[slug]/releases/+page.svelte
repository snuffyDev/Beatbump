<script lang="ts">
	import CarouselItem from "$components/Carousel/CarouselItem.svelte";
	import { Grid } from "$lib/components/Grid";
	import type { PageData } from "./$types";

	export let data: PageData;
	const { header, contents = [] } = data;
</script>

<main>
	<h1>{header?.artist}</h1>

	<Grid
		heading={header?.type}
		let:item
		let:index
		items={contents}
	>
		<CarouselItem
			isBrowseEndpoint={true}
			kind="trending"
			slot="item"
			{index}
			{item}
			aspectRatio={item.aspectRatio}
		/>
	</Grid>
</main>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
	}
</style>
