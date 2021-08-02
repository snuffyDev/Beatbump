<script>
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
	export let type
	import { goto } from '$app/navigation'
	import { search, searchState, theme } from '$lib/stores/stores'
	import { createEventDispatcher, tick } from 'svelte'
	import Icon from '../Icon/Icon.svelte'
	let endpoint = 'search'
	let filterType
	let songTitle = ''
	let filter = filterType ? filterType : options[0].params
	const dispatch = createEventDispatcher()
	// searchState.set({ option: undefined, text: undefined });
	$: console.log($searchState)
	async function handleSubmit(e) {
		e.preventDefault()
		dispatch('submitted', { submitted: true })
		searchState.set({ option: filter, text: songTitle })
		// invalidate($page.path)
		// let URL_BASE = new URL();
		let url =
			`/search/` +
			encodeURIComponent(encodeURIComponent(songTitle)) +
			`?filter=` +
			filter

		await tick()
		window.scrollTo({
			behavior: 'smooth',
			top: 0,
			left: 0
		})

		goto(url)
	}
</script>

<form class={type} on:submit|preventDefault={(e) => handleSubmit(e)}>
	<!-- <label for="search"><em>search</em></label> -->
	<div class="nav-item">
		<div aria-label="search" class="input">
			<div class="searchBtn" on:click={(e) => handleSubmit(e)}>
				<Icon name="search" size="1rem" />
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			{#if type == 'inline'}<input
					autofocus
					autocorrect="off"
					type="search"
					placeholder="Search"
					bind:value={songTitle} />
			{:else}<input
					autocorrect="off"
					type="search"
					placeholder="Search"
					bind:value={songTitle} />{/if}
		</div>
		<!-- <div class="nav-item inline">
				</div> -->
	</div>

	<!-- <label for="option"><em>search type</em></label> -->
	<div class="nav-item">
		<div
			class="select"
			aria-label="select"
			class:inline={type == 'inline' ? true : false}>
			<select
				on:blur={() => {
					searchState.set({ option: filter, text: songTitle })
				}}
				bind:value={filter}>
				{#each options as option (option.params)}
					<option value={option.params}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
</form>

<style lang="scss">
	.hidden {
		display: none;
		visibility: hidden;
	}

	.mobile-search {
		display: flex;
		/* flex-direction: row; */
		/* flex-wrap: nowrap; */
		max-height: 4rem;
		flex-flow: row nowrap !important;
	}
	.x-button {
		padding: 1em;

		right: 0;
		position: relative;
	}
	.sidebar {
		overflow-x: hidden;
		overflow-y: hidden;
		top: 0;
		padding: 0 0.3125rem 6rem;
		/* width: 17.2rem; */
		/* max-width: 17.2rem; */
		/* height: 100%; */
		/* min-height: 100%; */
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
		/* align-items: stretch; */
		/* justify-content: space-between; */
		/* width: 100%; */
		/* place-content: space-evenly; */
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
