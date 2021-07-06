<script>
	import Search from './Search.svelte'
	import { fade } from 'svelte/transition'
	import Icon from '$lib/Icon.svelte'
	import { circIn } from 'svelte/easing'
	import { goto } from '$app/navigation'
	import { clickOutside } from './js/clickOutside'
	import { theme } from './stores/stores'
	import { onMount } from 'svelte'

	export let width

	let isHidden = true
	let hidden = isHidden ? true : false
	$: curTheme = $theme
	let isSettings = true
	let settingsHidden = isSettings ? true : false
	let setTheme = $theme
	// onMount(() => {
	// 	if (!$theme) {
	// 		setTheme = $theme
	// 	} else {
	// 		setTheme = $theme
	// 	}
	// })
	let themeSet = $theme

	let themes = [{ name: 'dark' }, { name: 'dim' }, { name: 'ytm' }]
	$: theme.init($theme)
</script>

<div class="logo">
	<img
		src="/logo-header.png"
		width="2.5rem"
		height="0.5rem"
		alt="logo"
		title="Beatbump Home"
		on:click={() => goto('/')} />
</div>
{#if width < 640}
	<section class="homeIcon" on:click={() => goto('/')}>
		<Icon name="home" size="1.75em" />
	</section>
	<section class="items">
		{#if !hidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					hidden = !hidden
				}}
				class="nav-search"
				transition:fade={{ duration: 120, easing: circIn }}
				class:hidden>
				<!-- <label for="search"><em>search</em></label> -->
				<Search type="inline" />
				<div
					on:click={() => {
						hidden = !hidden
					}}
					class="x-button">
					<Icon name="x" size="1.5em" />
				</div>
			</div>
		{/if}
		<div
			class="nav-item"
			on:click={() => {
				hidden = !hidden
			}}>
			<svelte:component this={Icon} name="search" size="1.75em" />
		</div>
		{#if !settingsHidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					settingsHidden = false
				}}
				class="nav-settings"
				style={`background-color: var(--${curTheme}-top)}`}
				transition:fade={{ duration: 120, easing: circIn }}>
				<!-- <label for="search"><em>search</em></label> -->
				<span class="setting">
					<span class="s-text">Theme:</span>
					<div class="selectCont">
						<select class="select" bind:value={$theme}>
							{#each themes as theme}
								<option value={theme.name}>{theme.name}</option>
							{/each}
						</select>
					</div>
				</span>
			</div>
		{/if}
		<div
			class="nav-item"
			on:click={() => {
				settingsHidden = !settingsHidden
			}}>
			<svelte:component this={Icon} name="settings" size="1.75em" />
		</div>
	</section>
{/if}

<style lang="scss">
	.homeIcon {
		width: 2rem;
		max-width: 2rem;
		display: inline;
	}
	.s-text {
		margin-right: 0.8rem;
		/* align-self: start; */
		font-size: 1.1rem;
	}
	.x-button {
		padding: 1em;
	}
	.hidden {
		display: none;
	}
	.nav-search > :nth-child(2) {
		right: 0;
		position: fixed;
	}
	.nav-item {
		margin-bottom: 0;
	}
	.nav-settings {
		position: absolute;
		right: 0;
		bottom: -4em;
		display: flex;
		border-top: 0.125px rgba(170, 170, 170, 0.26) inset;
		background-color: inherit;
		padding: 0.5em;
		z-index: 10;
		/* flex-wrap: nowrap; */
		/* white-space: nowrap; */
		flex-direction: row;
		.setting {
			margin-right: 5rem;
			display: flex;
			flex-wrap: nowrap;
			align-items: center;
			vertical-align: top;
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
