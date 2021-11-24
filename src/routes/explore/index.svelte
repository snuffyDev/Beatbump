<script context="module">
	export async function load({ fetch, session }) {
		console.log(session)
		const data = await fetch('/explore.json?browseId=FEmusic_moods_and_genres')
		const response = await data.json()

		if (!data.ok) {
			return {
				error: new Error(data.statusText),

				status: data.status
			}
		}
		return {
			props: {
				response
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import { Grid } from '$lib/components/Grid'

	// import Grid from '$lib/components/Grid/Grid.svelte'

	export let response

	$: console.log(response)
	import { currentTitle } from '$lib/stores/stores'

	import { onMount } from 'svelte'
</script>

<svelte:head>
	<title
		>{$currentTitle == undefined || null ? 'Explore' : $currentTitle} - Beatbump</title
	>
</svelte:head>

<main>
	{#each response as section}
		<Grid items={[...section.section]} heading={section.title} let:item>
			<div
				slot="item"
				style={`border-left: 0.4286rem solid ${item.color}`}
				class="box"
			>
				<a sveltekit:prefetch href={`/explore/${item.endpoint.params}`}
					>{item.text}</a
				>
			</div>
		</Grid>
		<!-- <div class="breakout">
			<div class="box-cont">
				<div class="header">
					<h1>{section.title}</h1>
				</div>
				<box>
					{#each section.section as item}
					{/each}
				</box>
			</div>
		</div> -->
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
		min-width: 13rem;
		max-width: 20rem;
		border-radius: 0.8rem;
		width: 100%;
		align-items: center;
		white-space: nowrap;

		height: 3rem;
		padding: 0 0 0 1rem;

		a {
			display: inline-block;
			width: 100%;
		}
	}
</style>
