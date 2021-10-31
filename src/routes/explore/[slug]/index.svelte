<script context="module">
	export async function load({ page, fetch }) {
		const response = await fetch(`/explore/${page.params.slug}.json`)
		const { sections, header } = await response.json()
		return {
			props: {
				sections,
				header
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	export let sections
	export let header
	import GridItem from '../_components/GridItem.svelte'
	$: console.log(sections, header)
</script>

<main>
	<div class="header">
		<h1>{header}</h1>
	</div>
	{#each [...sections] as section}
		<h3>{section.title}</h3>
		<div class="grid">
			{#each section.section as item}
				<GridItem {item} />
			{/each}
		</div>
	{/each}
</main>

<style lang="scss">
	h1,
	h3 {
		letter-spacing: -0.02em;
	}
	h3 {
		font-weight: 600;
	}
	.header {
		margin-bottom: 0.8rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 0.5rem;

		// place-items: center;
		margin: 0 auto;
	}

	@media screen and (min-width: 25rem) and (max-width: 37rem) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media screen and (min-width: 37rem) and (max-width: 48rem) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
			grid-gap: 1rem;
		}
	}
	@media screen and (min-width: 48rem) {
		.grid {
			grid-template-columns: repeat(5, 1fr);
			grid-gap: 1.2rem;
		}
	}
</style>
