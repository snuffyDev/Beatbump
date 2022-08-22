<script lang="ts">
	import { GridItem, Grid } from "$lib/components/Grid";
	import type { PageData } from "./$types";

	export let data: PageData;
	const { header, contents = [] } = data;
</script>

<main>
	<h1>{header?.artist}</h1>

	<Grid heading={header?.type} let:item items={[...contents]}>
		<GridItem slot="item" {item} />
	</Grid>
</main>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
	}
</style>
