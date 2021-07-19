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

	export let width

	let isHidden = true
	let hidden = isHidden ? true : false
	$: curTheme = $theme
	let isSettings = true
	let settingsHidden = isSettings ? true : false
	let setTheme = localStorage.getItem('theme')
		? localStorage.getItem('theme')
		: ''
	$: setFilter = $filterAutoPlay

	let themeSet = $theme
	$: console.log($page.path)

	let themes = [
		{ name: 'dark' },
		{ name: 'dim' },
		{ name: 'ytm' },
		{ name: 'light' }
	]
</script>

<div
	use:clickOutside
	on:click_outside={() => {
		settingsHidden = !settingsHidden
	}}
	class="nav-settings"
	style={`background-color: var(--${curTheme}-top)}`}
	transition:fade={{ duration: 120, easing: circIn }}>
	<!-- <label for="search"><em>search</em></label> -->
	<div class="setting">
		<label for="select" class="s-text">Theme:</label>
		<div class="selectCont" style={`background-color: var(--${$theme}-forms)`}>
			<!-- svelte-ignore a11y-no-onchange -->
			<select
				id="select"
				class="select"
				bind:value={setTheme}
				on:change={() => {
					theme.set(setTheme)
				}}>
				{#each themes as theme}
					<option value={theme.name} selected={setTheme}>{theme.name}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="setting">
		<label for="checkbox" class="s-text"
			>Dedupe Automix:
			<input
				type="checkbox"
				bind:checked={setFilter}
				on:change={() => {
					filterAutoPlay.set(setFilter)
				}} />
		</label>
	</div>
</div>

<style lang="scss">
	.desktop.nav-item {
		// position: absolute;
		// right: 0;
		// z-index: 5;
	}
	.homeIcon {
		width: 2rem;
		max-width: 2rem;
		display: inline;
	}
	.s-text {
		padding: 0 0.8rem 0.2rem 0.8rem; /* align-self: start; */
		font-size: 1.1rem;
		// margin-right: 4rem;
	}
	.x-button {
		padding: 1em;
	}
	.hidden {
		display: none;
	}
	.shown {
		visibility: visible;
		display: block;
	}
	.desktop {
		visibility: hidden;
		display: none;
	}
	.nav-search > :nth-child(2) {
		right: 0;
		position: fixed;
	}
	.nav-item {
		margin-bottom: 0;
		&-desktop {
			place-items: end;
		}
	}
	.nav-settings {
		position: absolute;
		right: 0;
		top: 4em;
		display: flex;
		border-top: 0.125px inset hsla(0, 0%, 66.7%, 0.26);
		background-color: inherit;
		padding: 0.5em 0em 0.5em 0;
		z-index: 10;

		border-radius: 0 0rem 0.5rem 0.5rem;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
		max-width: 25%;
		@media screen and (max-width: 640px) {
			max-width: 100%;
		}
		// box-shadow: -0.125rem 0.3rem 0.25rem 0.125rem #00000052;
		border: 0.125px solid #aaaaaa45;
		border-top: 0;

		.setting {
			display: flex;
			flex-wrap: nowrap;
			align-items: stretch;
			padding: 0.2rem 0.4rem;
			margin-bottom: 0.5rem;
			// border-bottom: 0.0143rem #63636352 solid;
			// box-shadow: -0.125rem 0.3rem 0.25rem 0.125rem #63636352;
			// justify-content: space-around;
			// margin-bottom: 0.8rem;
			flex-direction: column;
			vertical-align: top;
			&:last-child {
				border-bottom: 0;
			}
		}
	}

	.items {
		display: flex;
		flex-direction: row;
		background-color: inherit;

		// width: 100%;
		margin-left: auto;
		.nav-item {
			margin-right: 1.75em;
		}
		:last-child {
			margin-right: 0;
		}
	}

	/* your styles go here */
</style>
