<script>
	import { fade } from 'svelte/transition'
	import Icon from '$components/Icon/Icon.svelte'
	import { circIn } from 'svelte/easing'
	import { goto } from '$app/navigation'
	import { clickOutside } from '$lib/js/clickOutside'
	import { filterAutoPlay, theme } from '$stores/stores'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { browser } from '$app/env'

	export let isSettingsOpen
	$: options = {
		theme: $theme,
		filter: $filterAutoPlay
	}
	let themes = [
		{ name: 'dark' },
		{ name: 'dim' },
		{ name: 'light' },
		{ name: 'midnight' },
		{ name: 'ytm' }
	]
</script>

{#if isSettingsOpen}
	<div
		use:clickOutside
		on:click_outside={() => {
			isSettingsOpen = !isSettingsOpen
		}}
		class="nav-settings"
		transition:fade={{ duration: 120, easing: circIn }}>
		<!-- <label for="search"><em>search</em></label> -->
		<div class="setting">
			<label for="select" class="s-text">Theme:</label>
			<div class="select">
				<!-- svelte-ignore a11y-no-onchange -->
				<select
					id="select"
					bind:value={options.theme}
					on:change={() => {
						theme.set(options.theme)
					}}>
					{#each themes as theme}
						<option value={theme.name} selected={options.theme}
							>{theme.name}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="setting">
			<label for="checkbox" class="s-text">Dedupe Automix: </label>
			<input
				type="checkbox"
				bind:checked={options.filter}
				on:change={() => {
					filterAutoPlay.set(options.filter)
				}} />
		</div>
	</div>
{/if}

<style lang="scss">
	.s-text {
		padding: 0 0.8rem 0.2rem 0.8rem;
		font-size: 1.1rem;
	}

	.nav-settings {
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
