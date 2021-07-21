<script>
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import { filterAutoPlay, theme } from '$stores/stores'
	import { iOS } from '$stores/stores'
	import Nav from '$components/Nav/Nav.svelte'
	import Sidebar from '$components/Sidebar/Sidebar.svelte'
	import Player from '$components/Player/Player.svelte'
	// import '../app.css'
	// import '../global/stylesheet.scss'
	import Wrapper from '$components/Wrapper/Wrapper.svelte'
	import { page } from '$app/stores'
	onMount(() => {
		iOS.init()
		const getTheme = () => {
			// console.log("themeswitch");
			let ls = localStorage.getItem('theme')
			ls ? theme.init(ls) : theme.init('dark')
			let filter = localStorage.getItem('filterAutoPlay')
			filter ? filterAutoPlay.init(filter) : filterAutoPlay.init(false)
			// console.log($filterAutoPlay)
			// if (ls) {
			// 	theme.init(ls);
			// } else {
			// 	theme.init("dark");
			// }
		}
		getTheme()
		return
	})
	let width

	$: curTheme = $theme
	let main
</script>

<svelte:window bind:innerWidth={width} />
<div
	class="body"
	class:light={$theme.includes('light') ? true : false}
	style={`background-color: var(--${$theme}-base)`}>
	{#if browser}
		<nav class="nav" style={`background-color: var(--${$theme}-top)`}>
			<Nav {width} />
		</nav>
		{#if width > 640}
			<Sidebar />
		{/if}
		<div
			class="wrapper"
			class:no-scroll={$page.path.includes('/search/') ? true : false}
			bind:this={main}
			id="wrapper">
			<Wrapper {main}>
				<slot />
			</Wrapper>
		</div>
		<footer
			class="footer-container"
			style={`background-color: var(--${$theme}-bottom)`}>
			<Player curTheme={$theme} />
		</footer>
	{/if}
</div>

<style lang="scss" global>
	@import '../global/stylesheet.scss';
	// @import "../global/vars.css";
	.no-scroll {
		overflow: hidden;
		overflow-y: hidden;
	}
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

		--light-base: rgb(243, 235, 235);
		--light-bottom: #121018;
		--light-top: #cac8c9;
		--light-forms: #aba9c3ff;
		--light-side: #cac8c9;
		--rich-black-fogra-29: #0c1217ff;
		--light-text: #0d0d0fff;
		--raisin-black: #171824ff;
	}
	.input {
		&.light {
			background-color: var(--darker-light);
		}
	}
	:global(.light) {
		* {
			color: var(--light-text);
		}
	}
	:root.dark {
		color: #f3f3f3;
	}
	.player {
		color: #f3f3f3;
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
		// background-color: theme-color('ytm', 'forms');
		background-color: var(--ytm-forms);
		&.light {
			background-color: var(--darker-light);
		}
	}
	// :global(.selectCont) {
	// 	background-color: theme-color('ytm', 'forms');
	// }
	:global(nav) {
		border-bottom: 0.25px rgba(170, 170, 170, 0.116) solid;
		// background-color: rgb(20 24 32 / 59%);
	}
	:global(.body) {
		scroll-behavior: smooth;
		text-rendering: optimizeLegibility;
	}
</style>
