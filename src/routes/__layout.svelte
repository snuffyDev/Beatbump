<script>
	import '../global/stylesheet.scss'
	import { browser } from '$app/env'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { currentTrack, theme } from '$lib/stores/stores'
	import * as utils from '$lib/utils'
	import { iOS } from '../lib/stores/stores'
	import Nav from './../lib/Nav.svelte'
	import Sidebar from '../lib/Sidebar.svelte'
	import Player from '../lib/Player.svelte'
	onMount(() => {
		iOS.init()
		if (!localStorage.getItem('theme')) theme.init('dim')
	})

	// await tick()
	let current = $currentTrack

	let width
	$: curTheme = $theme
</script>

<svelte:window bind:outerWidth={width} />
<body style={`background-color: var(--${curTheme}-base)`}>
	{#if browser}
		<nav class="nav" style={`background-color: var(--${curTheme}-top)`}>
			<Nav
				on:submitted={(event) => {
					let filter = event.detail.filter
					let songTitle = event.detail.query
					utils.searchTracks(songTitle, filter)
				}}
				{width} />
		</nav>
		{#if width > 640}
			<Sidebar
				on:submitted={(event) => {
					let filter = event.detail.filter
					let songTitle = event.detail.query
					utils.searchTracks(songTitle, filter)
				}} />
		{/if}
		<div class="wrapper" transition:fade>
			<slot />
		</div>

		<footer
			class="footer-container"
			style={`background-color: var(--${curTheme}-bottom)`}>
			<Player nowPlaying={current} />
		</footer>
	{/if}
</body>

<style lang="scss">
	.footer-container {
		/* position: fixed; */
		grid-area: f/f/f/f;
		height: 4rem;
		display: block;
	}
	:global(.sidebar) {
		background-color: theme-color('ytm', 'side');
	}
	:global(.input, .selectCont) {
		background-color: theme-color('ytm', 'forms');
	}
	:global(nav) {
		border-bottom: 0.25px rgba(170, 170, 170, 0.116) solid;
		// background-color: rgb(20 24 32 / 59%);
	}

	:global(body) {
		scroll-behavior: smooth;
		text-rendering: optimizeLegibility;
		img::before,
		video::before {
			display: block;
			content: '';
			padding-top: calc(100% * 2 / 3);
			/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
		}
	}
	.layout {
		display: grid;
	}
</style>
