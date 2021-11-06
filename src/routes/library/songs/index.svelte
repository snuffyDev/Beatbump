<script lang="ts">
	import Listing from '$lib/components/Item/Listing.svelte'

	import db from '$lib/db'

	import { onMount } from 'svelte'
	let value
	let songs = []
	onMount(async () => {
		songs = await db.getFavorites()
	})
	$: console.log(value, songs)
	let options = [
		{
			label: 'Unsorted',
			params: 'nosort',
			action: () => {
				// console.log('nosort', songs)
			}
		},
		{
			label: 'A-Z',
			params: 'az',
			action: () => {
				songs = [...songs.sort((a, b) => a.title.localeCompare(b.title))]
				// console.log('az', songs)
			}
		},
		{
			label: 'Z-A',
			params: 'za',
			action: () => {
				songs = [...songs.sort((a, b) => b.title.localeCompare(a.title))]
				// console.log('za', songs)
			}
		}
	]
</script>

<main>
	<h1>Your Songs</h1>
	<section>
		<div class="filter">
			<div class="ctx-item">
				<label for="select">Sort</label>
				<div class="select">
					<select id="select" bind:value on:change={options[value].action}>
						{#each options as option, i (option.params)}
							<option value={i}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		<section>
			{#key songs}
				{#each songs as song}
					<Listing data={song} />
				{/each}
			{/key}
		</section>
	</section>
</main>

<style lang="scss">
	.filter {
		display: inline-flex;
		flex-direction: row;
		margin-bottom: var(--md-spacing);
	}
	.ctx-item {
		display: flex;
		label {
			margin-right: var(--md-spacing);
			white-space: pre;
		}
	}
</style>
