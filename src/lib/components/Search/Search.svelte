<script lang="ts">
	export let type
	import { goto } from '$app/navigation'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import debounce from '$lib/js/debounce'
	import { searchState } from '$lib/stores/stores'
	import { createEventDispatcher } from 'svelte'

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
	]
	let filterType
	let query = ''
	let filter = filterType ? filterType : options[0].params
	const dispatch = createEventDispatcher()
	let results: [] = []
	async function handleSubmit() {
		dispatch('submitted', { submitted: true })
		let url = `/search/${encodeURIComponent(encodeURIComponent(query))}${
			filter !== undefined ? `?filter=${filter}` : ''
		}`
		goto(url)
	}
	const typeahead = debounce(async () => {
		if (query == '' || undefined) return (results = [])
		const response = await fetch(
			'/api/get_search_suggestions.json?q=' + encodeURIComponent(query)
		)
		results = await response.json()
		console.log(results)
	}, 250)
</script>

<form class={type} on:submit|preventDefault={handleSubmit}>
	<div class="nav-item">
		<div class="input">
			<div class="searchBtn" on:click={handleSubmit}>
				<Icon name="search" size="1rem" />
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				autofocus={type == 'inline' ? true : false}
				autocorrect="off"
				type="search"
				placeholder="Search"
				on:keyup={(e) => {
					if (e.shiftKey && e.ctrlKey && e.repeat) return
					typeahead()
				}}
				bind:value={query}
			/>
		</div>
	</div>
	{#if results.length > 0}
		<ul class="suggestions">
			{#each results as result (result?.id)}
				<li
					on:click={() => {
						query = result.query
						handleSubmit()
					}}
				>
					{result.query}
				</li>
			{/each}
		</ul>
	{/if}
	<div class="nav-item">
		<div class="select" class:inline={type == 'inline' ? true : false}>
			<select
				on:blur={() => {
					searchState.set({ option: filter, text: query })
				}}
				bind:value={filter}
			>
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
		background: inherit;
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
	form {
		background: inherit;
		&.inline {
			position: relative;
		}
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
	.nav-item {
		position: relative;
		margin-right: 0.25rem;
	}
	.hidden {
		display: none;
		visibility: hidden;
	}

	.mobile-search {
		display: flex;
		max-height: 4rem;
		flex-flow: row nowrap !important;
	}
	.x-button {
		padding: 1em;
		cursor: pointer;
		right: 0;
		position: relative;
	}
	.sidebar {
		overflow-x: hidden;
		overflow-y: hidden;
		top: 0;
		padding: 0 0.3125rem 6rem;
		border-right: 0.0625rem outset hsla(0, 0%, 66.7%, 0.123);
		box-sizing: border-box;
		display: none;
		visibility: hidden;
		contain: layout;
		grid-area: s;
		grid-template-rows: 1fr 1fr 1fr;
		grid-gap: 1rem;
		padding-inline: auto;
		box-shadow: -0.2rem 0.1rem 1rem 0.1rem rgb(0 0 0 / 49%);
		justify-items: center;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.53125rem;
	}
	form.inline {
		flex-direction: row;
		display: flex !important;
		flex-wrap: nowrap;
		.nav-item {
			margin-bottom: 0;
		}
	}
	.header-text {
		text-align: center;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		font-size: 1.125rem;
	}
	.head {
		width: 100%;
	}
	@media (min-width: 640px) {
		.sidebar {
			display: grid;
		}
	}
</style>
