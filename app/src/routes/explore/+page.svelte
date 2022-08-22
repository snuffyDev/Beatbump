<script lang="ts">
	import { Grid } from "$lib/components/Grid";
	import Header from "$lib/components/Layouts/Header.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	let path = data.path;
	let response = data.response;

	// $: console.log(response)
</script>

<Header title="Explore" url={path} desc="Find the perfect playlist that'll match your mood, or fit any occasion." />
<main>
	{#each response as section}
		<Grid items={[...section.section]} heading={section.title} let:item>
			<a
				slot="item"
				style={`border-left: 0.4286rem solid ${item.color}`}
				class="box"
				href={`/explore/${item.endpoint.params}`}
			>
				{item.text}
			</a>
		</Grid>
	{/each}
</main>

<style lang="scss">
	.box {
		margin-bottom: 0.8rem;
		cursor: pointer;
		background: #17151c;
		display: inline-flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-overflow: clip;
		font-size: 100%;
		min-width: 12rem;
		max-width: 20rem;
		border-radius: 0.8rem;
		width: 100%;
		align-items: center;
		white-space: nowrap;

		height: 3rem;
		padding: 0 0 0 1rem;
	}
</style>
