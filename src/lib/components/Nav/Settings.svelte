<script>
	import Search from '$components/Search/Search.svelte'
	import { fade } from 'svelte/transition'
	import Icon from '$components/Icon/Icon.svelte'
	import { circIn } from 'svelte/easing'
	import { goto } from '$app/navigation'
	import { clickOutside } from '$lib/js/clickOutside'
	import { filterAutoPlay, theme } from '$stores/stores'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	export let isSettings
	$: curTheme = $theme
	let setTheme = localStorage.getItem('theme')
		? localStorage.getItem('theme')
		: ''
	$: setFilter = $filterAutoPlay

	let themes = [
		{ name: 'dark' },
		{ name: 'dim' },
		{ name: 'ytm' },
		{ name: 'light' }
	]
</script>

{#if isSettings}
	<div
		use:clickOutside
		on:click_outside={() => {
			isSettings = !isSettings
		}}
		class="nav-settings"
		style={`background-color: var(--${curTheme}-top)}`}
		transition:fade={{ duration: 120, easing: circIn }}>
		<!-- <label for="search"><em>search</em></label> -->
		<div class="setting">
			<label for="select" class="s-text">Theme:</label>
			<div class="select" style={`background-color: var(--${$theme}-forms)`}>
				<!-- svelte-ignore a11y-no-onchange -->
				<select
					id="select"
					bind:value={setTheme}
					on:change={() => {
						theme.set(setTheme)
					}}>
					{#each themes as theme}
						<option

							value={theme.name}
							style={`background-color: var(--${setTheme}-forms); color: inherit;`}
							selected={setTheme}>{theme.name}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="setting">
			<label for="checkbox" class="s-text">Dedupe Automix: </label>
			<input
				type="checkbox"
				bind:checked={setFilter}
				on:change={() => {
					filterAutoPlay.set(setFilter)
				}} />
		</div>
	</div>
{/if}

<style lang="scss">
	.s-text {
		padding: 0 0.8rem 0.2rem 0.8rem; /* align-self: start; */
		font-size: 1.1rem;
		// margin-right: 4rem;
	}

	.nav-settings {
		// padding-left: 2em !important;
		right: 0;
		top: 4rem;
		display: flex;
		background-color: inherit;
		position: fixed;
		padding: 0.5em 0;
		z-index: 10;
		border-radius: 0 0 0.5rem 0.5rem;
		flex-direction: row;
		width: 100%;
		overflow: hidden;
		max-width: 44ch;
		border: 0.125px solid hsla(0, 0%, 66.7%, 0.27058823529411763);
		border-top: 0;
		white-space: pre-line;
		line-break: normal;
		word-break: normal;
		justify-content: space-evenly;
		@media screen and (max-width: 640px) {
			max-width: 100%;
			align-items: center;
			flex-direction: row;
		}
		border: 0.125px solid #aaaaaa45;
		border-top: 0;

		.setting {
			display: inline-flex;
			padding: 0.2rem 0.4rem;
			margin-bottom: 0.5rem;
			color: inherit;
			flex-direction: row;
			vertical-align: top;
			align-items: center;
		}
	}

	/* your styles go here */
</style>
