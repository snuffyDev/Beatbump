<script lang="ts">
	import { goto } from "$app/navigation";
	import GridItem from "./GridItem.svelte";

	export let items = [];
	export let heading = "";
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
</script>

<div class="grid-container">
	<div class="header">
		<span class="h2">{heading}</span>
		<slot name="buttons" />
	</div>
	<div class="grid">
		{#if items.length > 0}
			{#each items as item, i (item)}
				<GridItem {item} on:click={() => goto("/library/playlists/" + item.id)} />
			{/each}
		{/if}
		<GridItem
			item={{
				thumbnail:
					"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48cGF0aCBkPSJNMTI0LjA0IDkyaDcuOTJ2MzIuMDRIMTY0djcuOTJoLTMyLjA0VjE2NGgtNy45MnYtMzIuMDRIOTJ2LTcuOTJoMzIuMDRWOTJ6IiBmaWxsPSIjZmFmYWZhIi8+PC9nPjwvc3ZnPg==",
				name: "Add New Playlist",
			}}
			on:click={() => dispatch("new_playlist")}
		/>
	</div>
</div>

<style src="./index.scss" lang="scss">
</style>
