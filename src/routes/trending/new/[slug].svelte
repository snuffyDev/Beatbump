<script context="module">
	export async function load({ page, fetch }) {
		const response = await fetch(`/trending/new/${page.params.slug}.json`)
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
	import { goto } from '$app/navigation'
	$: console.log(sections, header)
</script>

<main>
	<div class="header">
		<h1>{header}</h1>
	</div>
	{#each sections as section}
		<div class="grid">
			{#each section.section as item}
				{#if item.type == 'albums'}
					<div
						class="item"
						on:click={() => goto('/release?id=' + item.browseId)}>
						<div class="img">
							<img loading="lazy" src={item.thumbnail} alt="thumbnail" />
						</div>
						<div class="item-title">{item.title}</div>
						<div class="item-subtitle">
							{#each item.subtitles as { text }}{text}{/each}
						</div>
					</div>
				{/if}
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
	}

	.item {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		// border: #aaaaaa40 solid 1px;
		justify-content: flex-start;
		border-radius: 0.4rem;
		padding: 0.5rem 0.4rem 0.4rem;
		position: relative;
		width: 100%;
		.img {
			width: 100%;
			margin-bottom: 0.5em;
		}
	}
	.item-title {
		display: inline;
		padding: 0.3rem 0.1rem;
		font-family: 'Commissioner';
		font-weight: 500;
		font-size: 1.1em;
		letter-spacing: -0.02em;
		margin-bottom: 0.5em;
	}

	@media screen and (min-width: 25rem) and (max-width: 37rem) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.item {
			max-width: 14rem;
		}
	}
	@media screen and (min-width: 37rem) and (max-width: 48rem) {
		.item {
			max-width: 13rem;
		}
		.grid {
			grid-template-columns: repeat(4, 1fr);
			grid-gap: 1rem;
		}
	}
	@media screen and (min-width: 48rem) {
		.item {
			max-width: 14rem;
		}
		.grid {
			grid-template-columns: repeat(5, 1fr);
			grid-gap: 1.2rem;
		}
	}
</style>
