<script lang="ts">
	import Icon from "$components/Icon/Icon.svelte";

	import { debounce } from "$lib/utils/sync";
	import { createEventDispatcher } from "svelte";
	let value = "";
	const dispatch = createEventDispatcher<{ input: { query: string } }>();
	const handleInput = debounce<KeyboardEvent>((event) => {
		dispatch("input", { query: value.toLocaleLowerCase() });
	}, 120);

	function handleSubmit() {
		dispatch("input", { query: value.toLocaleLowerCase() });
	}
</script>

<div role="textbox" aria-activedescendant="searchBox" class="input my-1">
	<div role="button" aria-label="search button" class="searchBtn" on:click={handleSubmit}>
		<Icon name="search" size="1rem" />
	</div>
	<!-- svelte-ignore a11y-autofocus -->
	<input
		aria-placeholder="Search"
		id="searchBox"
		autocomplete="off"
		aria-autocomplete="list"
		autocorrect="off"
		type="search"
		placeholder="Search"
		on:keyup={(e) => {
			if (e.shiftKey && e.ctrlKey && e.repeat) return;
			handleInput(e);
		}}
		bind:value
	/>
</div>

<style lang="scss">
	.input,
	input[type="search"] {
		min-width: 14em;
		max-width: 17em;
		min-height: unset;
		max-height: 5ch;
	}
	.input {
		// margin-left: auto;
	}
</style>
