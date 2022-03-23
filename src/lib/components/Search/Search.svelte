<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon/Icon.svelte';
	import debounce from '$lib/js/debounce';
	import { createEventDispatcher } from 'svelte';

	export let type;

	let options = [
		{ label: 'Songs', params: 'EgWKAQIIAWoKEAMQBBAKEAkQBQ%3D%3D' },
		{ label: 'Videos', params: 'EgWKAQIQAWoKEAMQBBAKEAkQBQ%3D%3D' },
		{ label: 'Artists', params: 'EgWKAQIgAWoKEAMQBBAKEAkQBQ%3D%3D' },
		{ label: 'All Playlists', params: 'EgWKAQIoAWoKEAMQBBAKEAUQCQ%3D%3D' },
		{
			label: 'Featured Playlists',
			params: 'EgeKAQQoADgBagwQDhAKEAkQAxAEEAU%3D'
		},
		{
			label: 'Community Playlists',
			params: 'EgeKAQQoAEABagwQDhAKEAkQAxAEEAU%3D'
		}
	];
	let filterType;
	let query = '';
	let filter = filterType ? filterType : options[0].params;
	const dispatch = createEventDispatcher();
	let results: Array<{ query?: string; id?: number }> = [];
	async function handleSubmit() {
		dispatch('submitted', { submitted: true });
		let url = `/search/${encodeURIComponent(encodeURIComponent(query))}${
			filter !== undefined ? `?filter=${filter}` : ''
		}`;
		goto(url);
	}
	const typeahead = debounce(async () => {
		if (query == '' || undefined) return (results = []);
		const response = await fetch(
			'/api/get_search_suggestions.json?q=' + encodeURIComponent(query)
		);
		results = await response.json();
	}, 250);
</script>

<form
	aria-expanded="true"
	aria-owns="suggestions"
	role="combobox"
	class={type}
	on:submit|preventDefault={handleSubmit}
>
	<div class="nav-item">
		<div role="textbox" aria-activedescendant="searchBox" class="input">
			<div
				role="button"
				aria-label="search button"
				class="searchBtn"
				on:click={handleSubmit}
			>
				<Icon name="search" size="1rem" />
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				aria-placeholder="Search"
				id="searchBox"
				autocomplete="off"
				aria-autocomplete="list"
				autofocus={type == 'inline' ? true : false}
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
		<div class="select" class:inline={type == 'inline' ? true : false}>
			<select bind:value={filter}>
				{#each options as option (option.params)}
					<option value={option.params}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
</form>

<style lang="scss">
	.suggestions {
		position: absolute;
		top: 121%;
		z-index: 10;
		background: var(--top-bg);
		width: 100%;
		/* max-height: 44vh; */
		border-radius: $lg-radius;
		height: auto;
		display: flex;
		flex-direction: column;
		&::after {
			position: absolute;
			top: 0;
			right: 0;
			border-radius: inherit;
			bottom: 0;
			left: 0;
			content: '';
			width: 100%;
			height: 100%;
			background: rgba(255, 255, 255, 0.007);
			z-index: 1;
			pointer-events: none;
			border: 0.0625rem solid hsla(0, 0%, 66.7%, 0.219);
		}
		@media only screen and (max-width: 640px) {
			left: 0;
			width: 100%;
			right: 0;
		}
		// padding: 0.4em;
	}
	form.inline {
		margin: 0 auto;
		position: relative;
	}
	ul {
		padding: 0;
		margin: 0;
		list-style: none;
		background: inherit;

		li {
			&:first-child {
				border-radius: $lg-radius $lg-radius 0 0;
			}
			&:last-child {
				border-radius: 0 0 $lg-radius $lg-radius;
			}
			transition: all cubic-bezier(0.47, 0, 0.745, 0.715) 50ms;

			padding: 0.7em 0.5em;
			z-index: 1;
			margin: 0;
			// border-radius: inherit;
			cursor: pointer;
			background: inherit;
			font-size: 1.08em;
			// height: 100%;
			// max-height: 5.125em;
			border-bottom: 1px solid #1a1a1a;
			&:hover {
				background: rgba(255, 255, 255, 0.1);
			}
		}
	}

	.x-button {
		padding: 1em;
		cursor: pointer;
		right: 0;
		position: relative;
	}
</style>
