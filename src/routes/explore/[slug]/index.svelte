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
	$: console.log(data)
</script>

<main>
	{#each data as section}
		<h1>{section.title}</h1>
		<div class="grid">
			{#each section.section as item}
				<div class="item">
					<div class="img"><img src={item.thumbnail} alt="thumbnail" /></div>
					<div class="item-title">{item.title}</div>
				</div>
			{/each}
		</div>
	{/each}
</main>

<style lang="scss">
	.grid {
		display: flex;
		flex-wrap: wrap;
	}
	.item {
		display: flex;
		width: 11rem;
		height: 11rem;

		.img {
		}
	}
</style>
