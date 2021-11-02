<script context="module">
	export async function load({ fetch, page }) {
		let browseId = page.query.get('browseId')
		let params = page.query.get('params')
		let itct = page.query.get('itct')
		const response = await fetch(
			`/artist/releases.json?browseId=${encodeURIComponent(
				browseId
			)}&params=${params}&itct=${itct}`
		)
		const { header, contents } = await response.json()
		return {
			props: {
				header: await header,
				contents: await contents
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	import GridItem from './_GridItem.svelte'

	export let header
	export let contents = []

	$: console.log(header, contents)
</script>

<h1>{header?.artist}</h1>
<h2>{header?.type}</h2>
<div class="grid">
	{#each contents as item}
		<GridItem {item} />
	{/each}
</div>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
	}
</style>
