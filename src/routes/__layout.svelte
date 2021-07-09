<script>
	import '../global/stylesheet.scss'
	import { browser } from '$app/env'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { currentTrack, theme } from '$lib/stores/stores'
	import * as utils from '$lib/utils'
	import { iOS } from '$lib/stores/stores'
	import Nav from '$lib/components/Nav/Nav.svelte'
	import Sidebar from '$lib/components/Sidebar/Sidebar.svelte'
	import Player from '$lib/components/Player/Player.svelte'
	onMount(() => {
		iOS.init()
		const getTheme = () => {
			let ls = localStorage.getItem('theme')
			if (ls) {
				theme.init(ls)
			} else {
				theme.init('dark')
			}
			console.log(localStorage.getItem('theme'))
		}
		getTheme()
		// if (!localStorage.getItem('theme')) theme.init('dark')
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

<style lang="scss">
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
	}
</style>
