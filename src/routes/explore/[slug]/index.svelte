<script context="module">
	export async function load({ page, fetch }) {
		const response = await fetch(`/explore/${page.params.slug}.json`)
		const data = await response.json()
		return {
			props: {
				data
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	export let data
	import { goto } from '$app/navigation'
	$: console.log(data)
</script>

<main>
	{#each data as section}
		<h1>{section.title}</h1>
		<div class="grid">
			{#each section.section as item}
				<div
					class="item"
					on:click={() => goto('/playlist?list=' + item.browseId)}>
					<div class="img">
						<img loading="lazy" src={item.thumbnail} alt="thumbnail" />
					</div>
					<div class="item-title">{item.title}</div>
				</div>
			{/each}
		</div>
	{/each}
</main>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 0.5rem;
	}
	.item {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		border: #aaaaaa40 solid 1px;
		justify-content: flex-start;
		border-radius: 0.4rem;
		padding: 0.5rem 0.4rem 0.4rem;
		position: relative;
		width: 100%;
		.img {
			width: 100%;
		}
	}
	.item-title {
		display: inline;
		padding: 0.3rem 0.1rem;
		font-family: 'Commissioner';
		font-weight: 500;
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
			max-width: 17rem;
		}
		.grid {
			grid-template-columns: repeat(3, 1fr);
			grid-gap: 1rem;
		}
	}
	@media screen and (min-width: 48rem) {
		.item {
			max-width: 16rem;
		}
		.grid {
			grid-template-columns: repeat(4, 1fr);
			grid-gap: 1.2rem;
		}
	}
</style>
