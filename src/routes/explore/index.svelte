<script context="module">
	export async function load({ fetch }) {
		const data = await fetch('/explore.json?browseId=FEmusic_moods_and_genres')
		const response = await data.json()

		if (data.ok) {
			return {
				props: {
					response
				},
				maxage: 3600,
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	export let response

	$: console.log(response)
	import { currentTitle } from '$lib/stores/stores'

	import { onMount } from 'svelte'
</script>

<svelte:head>
	<title
		>{$currentTitle == undefined || null ? 'Explore' : $currentTitle} - Beatbump</title>
</svelte:head>

<main>
	{#each response as section}
		<div class="breakout">
			<div class="box-cont">
				<h3>{section.title}</h3>
				<box>
					{#each section.section as item}
						<div
							style={`border-left: 0.4286rem solid ${item.color}`}
							class="box">
							<a href={`/explore/${item.endpoint.params}`}>{item.text}</a>
						</div>
					{/each}
				</box>
				<a class="link" href="/explore">See All</a>
			</div>
		</div>
	{/each}
</main>

<style lang="scss">
	.breakout {

		border-radius: 0.8rem;

	}
	.box-cont {
		justify-content: space-around;

		padding: 0.8rem;
	}
	box {
		display: grid;


		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

		grid-gap: 0.8rem;
	}
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
		min-width: 180px;
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
