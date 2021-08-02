<script context="module">
	export const load = async ({ page }) => ({
		props: {
			key: page.path
		}
	})
</script>

<script>
	import { onMount } from 'svelte'
	import { errorHandler, filterAutoPlay, theme } from '$stores/stores'
	import { iOS } from '$stores/stores'
	import Nav from '$components/Nav/Nav.svelte'
	import Sidebar from '$components/Sidebar/Sidebar.svelte'
	import Player from '$components/Player/Player.svelte'
	import Wrapper from '$components/Wrapper/Wrapper.svelte'
	import { page } from '$app/stores'
	import Alert from '$lib/components/Alert/Alert.svelte'
	import { browser } from '$app/env'
	export let key
	let loaded
	onMount(() => {
		iOS.init()
		theme.init()
		let filter = localStorage.getItem('filterAutoPlay')
		filter ? filterAutoPlay.init(filter) : filterAutoPlay.init(false)
		loaded = true
	})
	let width
	let main
	// $: console.log(hasError, errorKey)
</script>

<svelte:window bind:innerWidth={width} />
<div class="body">
	<Nav {width} />
	<Sidebar />
	<div
		class="wrapper"
		class:no-scroll={$page.path.includes('/search/') ? true : false}
		bind:this={main}
		id="wrapper">
		<Wrapper {key} {main}>
			<slot />
		</Wrapper>
	</div>
	<div class="alert-container">
		<Alert message={$errorHandler.msg} color="red" />
	</div>
	<footer class="footer-container">
		{#if browser && loaded}
			<Player />
		{/if}
	</footer>
</div>

<style lang="scss" global>
	@import '../global/stylesheet.scss';
	.alert-container {
		display: flex;
		position: fixed;
		bottom: 5rem;
		left: 0;
		right: 0;
		justify-content: center;
	}
	.no-scroll {
		overflow: hidden;
		overflow-y: hidden;
	}
	:root {
		--ytm-bottom: #121018;
		--ytm-base: #09090a;
		--ytm-top: #09090a;
		--ytm-forms: #15141d;
		--ytm-side: #1210183a;

		--dark-bottom: #111214;
		--dark-base: #09090a;
		--dark-top: #111214;
		--dark-forms: #131516;
		--dark-side: #13171b33;

		--dim-bottom: #141820;
		--dim-base: #09090a;
		--dim-top: #141820;
		--dim-forms: #131516;
		--dim-side: #0b0c0f;

		--light-base: #fcf8f8;
		--light-bottom: #121018;
		--light-top: #cac8c9;
		--light-forms: #e3dbf5;
		--light-side: #cac8c9;
		--rich-black-fogra-29: #0c1217ff;
		--light-text: #131314;
		--raisin-black: #171824ff;

		--midnight-base: #05070a;
		--midnight-top: #0d0813;
		--midnight-side: #0c091a0e;
		--midnight-bottom: #090d11;
		--midnight-forms: #100f17;
	}

	.footer-container {
		width: 100%;
		max-width: 100%;
		grid-area: f/f/f/f;
		position: relative;
		&::before {
			background: var(--midnight-bottom);
			position: fixed;
			z-index: -1;
			right: 0;
			bottom: 0;
			left: 0;
			content: '';
			width: 100%;
			height: 4.7rem;
		}
		&::after {
			background: #232530;
			position: absolute;
			bottom: 4rem;
			z-index: -1;
			right: 0;
			left: 0;
			content: '';
			width: 100%;
			height: 0.5rem;
		}
	}
	html {
		color: #f3f3f3;
		a small {
			color: #999393;
			&:hover {
				color: #a5a5a5;
			}
		}
		&.dark {
			background: var(--dark-base);
			.footer-container,
			.player {
				background: var(--dark-bottom);
			}
			.select,
			.input {
				background: var(--dark-forms);
			}

			nav {
				background: var(--dark-top);
			}
			aside,
			.sidebar {
				background: var(--dark-side);
			}
		}
		&.dim {
			background: var(--dim-base);
			.footer-container,
			.player {
				background: var(--dim-bottom);
			}
			.select,
			.input {
				background: var(--dim-forms);
			}
			nav {
				background: var(--dim-top);
			}
			aside,
			.sidebar {
				background: var(--dim-side);
			}
		}
		&.ytm {
			background: var(--ytm-base);
			.footer-container,
			.player {
				background: var(--ytm-bottom);
			}
			.select,
			.input {
				background: var(--ytm-forms);
			}
			nav {
				background: var(--ytm-top);
			}
			aside,
			.sidebar {
				background: var(--ytm-side);
			}
		}

		&.midnight {
			background: var(--midnight-base);
			.footer-container,
			.player {
				background: var(--midnight-bottom);
			}
			.select,
			.input {
				background: var(--midnight-forms);
			}
			nav {
				background: var(--midnight-top);
			}
			aside,
			.sidebar {
				background: var(--midnight-side);
			}
		}
		&.light {
			* {
				color: var(--light-text);
			}
			background: var(--light-base);
			.footer-container,
			.player {
				background: var(--light-bottom);
			}
			.select,
			select,
			.input,
			option {
				background: var(--light-forms);
			}
			nav {
				background: var(--light-top);
			}
			a small {
				color: #464646;
				&:hover {
					color: #9e9e9e;
				}
			}
			aside,
			.sidebar {
				background: var(--light-side);
			}
		}
	}
	.footer-container {
		grid-area: f/f/f/f;
		position: fixed;
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
