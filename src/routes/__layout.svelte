<script>
	import '../global/stylesheet.scss'
	import '../app.css'
	import { browser } from '$app/env'
	import { fade, scale } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { currentTrack, theme } from '$stores/stores'
	import * as utils from '$lib/utils'
	import { iOS } from '$stores/stores'
	import Nav from '$components/Nav/Nav.svelte'
	import Sidebar from '$components/Sidebar/Sidebar.svelte'
	import Player from '$components/Player/Player.svelte'
	onMount(() => {
		iOS.init()
		const getTheme = () => {
			let ls = localStorage.getItem('theme')
			if (ls) {
				theme.init(ls)
			} else {
				theme.init('dark')
			}
		}
		getTheme()
	})

	let current = $currentTrack

	let width
	$: curTheme = $theme
</script>

<svelte:window bind:innerWidth={width} />
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

<style lang="scss" global>
	:root {
		--ytm-bottom: #121018;
		--ytm-base: #09090a;
		--ytm-top: #09090a;
		--ytm-forms: #12101844;
		--ytm-side: #1210183a;

		--dark-bottom: #111214;
		--dark-base: #09090a;
		--dark-top: #111214;
		--dark-forms: #181a1a86;
		--dark-side: #0b0c0c;

		--dim-bottom: rgb(20, 24, 32);
		--dim-base: rgb(9 9 10);
		--dim-top: rgb(20, 24, 32);
		--dim-forms: #181a1a86;
		--dim-side: #0b0c0f;
	}
	.footer-container {
		/* position: fixed; */
		grid-area: f/f/f/f;
		height: 4rem;
		display: block;
		z-index: 1;
	}
	:global(.sidebar) {
		background-color: theme-color('ytm', 'side');
	}
	:global(.input) {
		background-color: theme-color('ytm', 'forms');
	}
	:global(.selectCont) {
		background-color: theme-color('ytm', 'forms');
	}
	:global(nav) {
		border-bottom: 0.25px rgba(170, 170, 170, 0.116) solid;
		// background-color: rgb(20 24 32 / 59%);
	}
	:global(body) {
		scroll-behavior: smooth;
		text-rendering: optimizeLegibility;
	}
</style>
