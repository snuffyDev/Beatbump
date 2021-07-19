<script>
	let options = [
		{ label: 'Songs', params: 'EgWKAQIIAWoKEAMQBBAKEAUQCQ%3D%3D' },
		{ label: 'Videos', params: 'EgWKAQIQAWoKEAMQBBAKEAUQCQ%3D%3D' },
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
		search.set([])
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
		<div
			class="input"
			style={`background-color: var(--${$theme}-forms)`}
			class:inline={type == 'inline' ? true : false}>
			<div class="searchBtn" on:click={(e) => handleSubmit(e)} />
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
			class="selectCont"
			style={`background-color: var(--${$theme}-forms)`}
			class:inline={type == 'inline' ? true : false}>
			<select
				style={`background-color: var(--${$theme}-forms)`}
				class="select"
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
	<button class="search" class:hidden={type == 'inline' ? false : true}
		><Icon name="search" size="1.5em" /></button>
</form>

<style lang="scss">
	button {
		background: transparent !important;
		color: inherit !important;
		padding: 0.4em;
		border: none !important;
	}
	.mobile-search {
		display: flex;
		/* flex-direction: row; */
		/* flex-wrap: nowrap; */
		max-height: 4rem;
		flex-flow: row nowrap !important;
	}
	.selectCont {
		max-width: 100%;
		&.inline {
			max-width: 8rem;
		}
	}
	.sidebar {
		padding: 0 0.3125rem;
		/* position: fixed; */
		overflow-x: hidden;
		top: 0;
		bottom: 6rem;
		padding-bottom: 6rem;
		width: 16rem;
		height: 100%;
		min-height: 100%;
		border-right: 0.0625rem outset hsla(0, 0%, 66.7%, 0.123);
		/* padding-top: 4.3125rem; */
		box-sizing: border-box;
		background-color: #1f1f3f21;
		display: none;
		grid-area: s;
		grid-template-rows: auto 1fr auto;
		grid-gap: 1rem;
		padding-inline: auto;
		box-shadow: -0.2rem 0.1rem 1rem 0.1rem rgba(0, 0, 0, 0.486);
		justify-items: center;
	}

	.nav-item {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-bottom: 0.53125rem;
	}
	.inline {
		flex-direction: row !important;
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
