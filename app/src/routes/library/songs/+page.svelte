<script lang="ts">
	import Listing from "$lib/components/Item/Listing.svelte";
	import { IDBService } from "$lib/workers/db/service";
	import { onMount, setContext } from "svelte";

	let value;
	let songs = [];

	setContext({}, "library");

	onMount(async () => {
		songs = await IDBService.sendMessage("get", "favorites");
	});

	let options = [
		{
			label: "Unsorted",
			params: "nosort",
			action: async () => {
				songs = await IDBService.sendMessage("get", "favorites");
			},
		},
		{
			label: "A-Z",
			params: "az",
			action: () => {
				songs = [...songs.sort((a, b) => a.title.localeCompare(b.title))];
			},
		},
		{
			label: "Z-A",
			params: "za",
			action: () => {
				songs = [...songs.sort((a, b) => b.title.localeCompare(a.title))];
			},
		},
	];
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
		margin-bottom: $md-spacing;
	}
	.ctx-item {
		display: flex;
		label {
			margin-right: $md-spacing;
			white-space: pre;
		}
	}
</style>
