<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "$lib/components/Icon/Icon.svelte";
	import { preserveSearch } from "$lib/stores";
	import { debounce } from "$lib/utils/sync";
	import { createEventDispatcher } from "svelte";
	import { fullscreenStore } from "../Player/channel";
	import { searchFilter } from "./options";

	export let type;
	export let query = "";
	export let filter = searchFilter[0].params;

	let filterType;
	const dispatch = createEventDispatcher();
	let results: Array<{ query?: string; id?: number }> = [];
	async function handleSubmit() {
		dispatch("submitted", { submitted: true, filter, query });
		fullscreenStore.set("closed");
		let url = `/search/${query}${filter !== undefined ? `?filter=${filter}` : ""}`;
		goto(url);
	}
	const typeahead = debounce(async () => {
		if (query == "" || undefined) return (results = []);
		const response = await fetch("/api/v1/get_search_suggestions.json?q=" + encodeURIComponent(query));
		results = await response.json();
	}, 250);
</script>

<form aria-expanded="true" aria-owns="suggestions" role="combobox" class={type} on:submit|preventDefault={handleSubmit}>
	<div class="nav-item">
		<div role="textbox" aria-activedescendant="searchBox" class="input">
			<div role="button" aria-label="search button" class="searchBtn" on:click={handleSubmit}>
				<Icon name="search" size="1rem" />
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				aria-placeholder="Search"
				id="searchBox"
				autocomplete="off"
				aria-autocomplete="list"
				autofocus={type == "inline" ? true : false}
				autocorrect="off"
				type="search"
				placeholder="Search"
				on:keyup={(e) => {
					if (e.shiftKey && e.ctrlKey && e.repeat) return;
					typeahead();
				}}
				bind:value={query}
			/>
		</div>
	</div>
	{#if results.length > 0}
		<ul role="listbox" id="suggestions" class="suggestions">
			{#each results as result (result?.id)}
				<li
					on:click={() => {
						query = result.query;
						handleSubmit();
					}}
				>
					{result.query}
				</li>
			{/each}
		</ul>
	{/if}
	<div class="nav-item">
		<div class="select" class:inline={type == "inline" ? true : false}>
			<select bind:value={filter}>
				{#each searchFilter as option (option.params)}
					<option value={option.params}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
</form>

<style lang="scss">
	.nav-item {
		margin: 0 0.4rem;
	}
	.suggestions {
		position: absolute;
		top: 4.5em;
		z-index: 200;
		background: var(--top-bg);
		width: 100%;

		width: clamp(28vw, 35vw, 78vw);
		/* max-height: 44vh; */
		border-radius: $xs-radius;
		height: auto;
		display: flex;
		flex-direction: column;
		touch-action: none;
		margin: 0 auto;

		&::after {
			position: absolute;
			top: 0;
			right: 0;
			border-radius: inherit;
			bottom: 0;
			left: 0;
			content: "";
			width: 100%;
			height: 100%;
			background: rgba(255, 255, 255, 0.007);
			z-index: -1;
			pointer-events: none;
			border: 0.0625rem solid hsla(0, 0%, 66.7%, 0.219);
		}
		@media only screen and (max-width: 640px) {
			left: 0;

			width: clamp(68%, 78%, 95%);
			right: 0;
		}
		// padding: 0.4em;
	}
	form.inline {
		position: absolute;
		height: 4em;
		touch-action: none;
		display: flex;
		justify-content: center;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
	}
	ul {
		padding: 0;
		margin: 0;
		list-style: none;
		background: inherit;

		li {
			&:first-child {
				border-radius: $xs-radius $xs-radius 0 0;
			}
			&:last-child {
				border-radius: 0 0 $xs-radius $xs-radius;
			}
			transition: background-color cubic-bezier(0.47, 0, 0.745, 0.715) 80ms;

			padding: 0.7em 0.5em;
			z-index: 1;
			margin: 0;
			// border-radius: inherit;
			cursor: pointer;
			// background: inherit;
			font-size: 1em;
			background: #0000;
			// height: 100%;
			// max-height: 5.125em;
			// border-bottom: 1px solid #1a1a1a;
			&:hover {
				background: rgba(255, 255, 255, 0.1);
			}
		}
	}
</style>
