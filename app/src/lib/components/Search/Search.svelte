<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "$lib/components/Icon/Icon.svelte";
	import { queryParams } from "$lib/utils";
	import { debounce } from "$lib/utils/sync";
	import { settings } from "$stores/settings";
	import { createEventDispatcher } from "svelte";
	import { fullscreenStore } from "../Player/channel";
	import { searchFilter } from "./options";

	export let type: "inline";
	export let query = "";
	export let filter = searchFilter[0].params;

	const dispatch = createEventDispatcher();
	let results: Array<{ query?: string; id?: number }> = [];
	let listbox: HTMLFormElement;

	async function handleSubmit() {
		if (!query.length) return;
		dispatch("submitted", { submitted: true, filter, query });
		fullscreenStore.set("closed");
		const params = queryParams({
			filter,
			restricted: $settings.search.Restricted,
		});
		let url = `/search/${encodeURIComponent(query)}?${params}`;
		goto(url);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!listbox) return;
		const target = event.target as HTMLLIElement;

		if (event.key === "ArrowDown") {
			if (
				target.nextElementSibling?.parentElement !== listbox &&
				target.id !== "searchBox"
			)
				return;

			const next =
				target.nextElementSibling?.parentElement === listbox
					? (target.nextElementSibling as HTMLElement)
					: (listbox.querySelector("li") as HTMLLIElement);

			next.tabIndex = 0;
			target.tabIndex = -1;
			next.focus();
		}
		if (event.key === "ArrowUp") {
			if (
				target.previousElementSibling?.parentElement !== listbox &&
				target.id !== "searchBox" &&
				target.parentElement?.previousElementSibling?.classList.contains(
					"nav-item",
				) !== true
			)
				return;

			const next =
				target.previousElementSibling?.parentElement === listbox
					? (target.previousElementSibling as HTMLElement)
					: target.parentElement?.previousElementSibling?.classList.contains(
							"nav-item",
					  ) === true
					? (target.parentElement?.previousElementSibling?.querySelector<HTMLInputElement>(
							"input",
					  ) as HTMLInputElement)
					: (listbox.querySelector("li") as HTMLLIElement);

			next.tabIndex = 0;
			target.tabIndex = -1;
			next.focus();
		}

		return false;
	}
	const typeahead = debounce(async () => {
		if (!query) return (results = []);
		const response = await fetch(
			"/api/v1/get_search_suggestions.json?q=" + encodeURIComponent(query),
		);
		results = await response.json();
	}, 250);
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<form
	aria-expanded="true"
	aria-owns="suggestions"
	role="listbox"
	class={type}
	on:keydown={handleKeyDown}
	on:submit|preventDefault={handleSubmit}
>
	<div class="nav-item">
		<div
			role="textbox"
			class="input"
		>
			<!-- svelte-ignore a11y-interactive-supports-focus -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				role="button"
				aria-label="search button"
				class="searchBtn"
				on:click={handleSubmit}
			>
				<Icon
					name="search"
					size="1rem"
				/>
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				aria-placeholder="Search"
				id="searchBox"
				autocomplete="off"
				aria-autocomplete="list"
				autofocus={type === "inline" ? true : false}
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
		<ul
			role="listbox"
			id="suggestions"
			bind:this={listbox}
			class="suggestions"
		>
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			{#each results as result (result?.id)}
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<li
					tabindex="0"
					on:click={() => {
						query = result.query;
						handleSubmit();
					}}
					on:keydown={(e) => {
						if (e.key === " ") {
							query = result.query;
							handleSubmit();
						}
					}}
				>
					{result.query}
				</li>
			{/each}
		</ul>
	{/if}
	<div class="nav-item">
		<div
			class="select"
			class:inline={type === "inline" ? true : false}
		>
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

		border-radius: $xs-radius;
		height: auto;
		display: flex;
		flex-direction: column;
		touch-action: none;
		margin: 0 auto;

		&::after {
			position: absolute;
			inset: 0;
			border-radius: inherit;
			content: "";
			width: 100%;
			height: 100%;
			background: rgb(255 255 255 / 0.7%);
			z-index: -1;
			pointer-events: none;
			border: 0.0625rem solid hsl(0deg 0% 66.7% / 21.9%);
		}

		@media only screen and (max-width: 640px) {
			left: 0;
			width: clamp(68%, 78%, 95%);
			right: 0;
		}
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
			cursor: pointer;
			font-size: 1em;
			background: #0000;
			&:hover {
				background: rgb(255 255 255 / 10%);
			}
		}
	}
</style>
