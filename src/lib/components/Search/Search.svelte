<script>
	import { searchTracks } from '../../utils'
	let options = [
		{ label: 'Songs', params: 'EgWKAQIIAWoKEAMQBBAKEAUQCQ%3D%3D' },
		{ label: 'Videos', params: 'EgWKAQIQAWoKEAMQBBAKEAUQCQ%3D%3D' },
		{ label: 'Playlists', params: 'EgWKAQIoAWoKEAMQBBAKEAUQCQ%3D%3D' }
	]
	export let type
	import { goto, invalidate } from '$app/navigation'
	import { page } from '$app/stores'
	import { search } from '$lib/stores/stores'
	import { tick } from 'svelte'
	let endpoint = 'search'
	let filterType
	let songTitle = ''
	let filter = filterType ? filterType : options[0].params
	async function handleSubmit(s, f) {
		// invalidate($page.path)

		let url = `/search/${s}?filter=${f}`
		// search.set([])
		await tick()
		window.scrollTo({
			behavior: 'smooth',
			top: 0
		})
		goto(url, { replaceState: true })
	}
</script>

<form class={type} on:submit|preventDefault={handleSubmit(songTitle, filter)}>
	<!-- <label for="search"><em>search</em></label> -->
	<div class="nav-item">
		<div class="input">
			<div class="searchBtn" on:click={handleSubmit(songTitle, filter)} />
			<input
				autofocus
				autocorrect="off"
				type="search"
				placeholder="Search"
				bind:value={songTitle} />
		</div>
	</div>

	<!-- <label for="option"><em>search type</em></label> -->
	<div class="nav-item">
		<div class="selectCont">
			<select class="select" bind:value={filter}>
				{#each options as option (option.params)}
					<option value={option.params}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
</form>

<style lang="scss">
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
