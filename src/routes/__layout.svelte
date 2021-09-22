<script context="module">
	export const load = async ({ page }) => ({
		props: {
			key: page.path
		},
		context: { page: page.path }
	})
</script>

<script>
	import { browser } from '$app/env'
	import Nav from '$components/Nav/Nav.svelte'
	import Player from '$components/Player/Player.svelte'
	import Wrapper from '$components/Wrapper/Wrapper.svelte'
	import Alert from '$lib/components/Alert/Alert.svelte'
	import { filterAutoPlay, iOS, theme } from '$stores/stores'
	import { onMount } from 'svelte'
	export let key
	let main
	onMount(() => {
		iOS.init()
		theme.init()
		let filter = localStorage.getItem('filterAutoPlay')
		filter ? filterAutoPlay.init(filter) : filterAutoPlay.init(false)
	})
</script>

<Nav {key} />
<div
	class="wrapper"
	class:no-scroll={key.includes('/search/') ? true : false}
	bind:this={main}
	id="wrapper"
>
	<Wrapper {key} {main}>
		<slot />
	</Wrapper>
</div>
<Alert />
<footer class="footer-container">
	{#if browser}
		<Player />
	{/if}
</footer>

<style lang="scss" global>
	@use '../global/stylesheet/main';
	.no-scroll {
		overflow: hidden;
		overflow-y: hidden;
	}

	$sections: (
		bottom: (
			footer-container,
			player
		),
		top: (
			nav
		),
		forms: (
			select,
			input,
			option,
			suggestions
		)
	);
	$themes: (dark, dim, midnight, light, ytm);

	.footer-container {
		width: 100%;
		max-width: 100%;
		grid-area: f/f/f/f;
		position: relative;
		z-index: 1;
		height: 100%;
		// &::before {
		// 	background: var(--midnight-bottom);
		// 	position: fixed;
		// 	z-index: -1;
		// 	right: 0;
		// 	bottom: 0;
		// 	left: 0;
		// 	content: '';
		// 	width: 100%;
		// 	height: 4.5rem;
		// }
		// &::after {
		// 	background: #232530;
		// 	position: absolute;
		// 	bottom: 4rem;
		// 	z-index: -1;
		// 	right: 0;
		// 	left: 0;
		// 	content: '';
		// 	width: 100%;
		// 	height: 0.5rem;
		// }
	}

	.footer-container {
		grid-area: f/f/f/f;
		// position: fixed;
		bottom: 0;
		display: block;
		z-index: 1;
		width: 100%;
		min-width: 100%;
	}

	:root .light * {
		color: var(--light-text);
	}
	:root .dark * {
		color: #f3f3f3;
	}
	.player {
		color: #f3f3f3;
	}
</style>
