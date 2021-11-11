<script>
	import { browser } from '$app/env'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import Icon from '$components/Icon/Icon.svelte'
	import Search from '$components/Search/Search.svelte'
	import { tooltip } from '$lib/actions/tooltip'
	import { clickOutside } from '$lib/js/clickOutside'
	import { circIn } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import Settings from './Settings.svelte'

	export let key
	let isHidden = true
	let hidden = isHidden ? true : false
	let isSettingsOpen
	let shown

	const navBack = () => {
		if (!browser) return

		window.history.go(-1)
	}
</script>

<nav class="nav">
	<div class="logo">
		{#if key !== '/home'}
			<div class="logo-back" on:click={() => goto('/home')}>
				<img
					style="margin-left:1.5rem;"
					src="/logo.svg"
					alt="logo"
					title="Beatbump Home"
				/>
			</div>
			<div on:click={navBack}>
				<Icon name="chevron-left" size="1.5em" />
			</div>
		{:else}
			<img
				on:click={() => goto('/home')}
				src="/logo.svg"
				alt="logo"
				title="Beatbump Home"
			/>
		{/if}
	</div>

	<div class="middle">
		<div
			class="nav-item  homeIcon"
			use:tooltip
			data-tooltip="Home"
			on:click={() => goto('/home')}
			class:active={$page.path.includes('home')}
		>
			<!-- <div class="nav-text">Home</div> -->
			<Icon
				name="home"
				color={$page.path.includes('home') ? '#fff' : '#BCBCBE'}
				size="1.5em"
			/>
		</div>

		<div
			class="nav-item trending"
			use:tooltip
			data-tooltip="Trending"
			class:active={$page.path.includes('trending')}
			on:click={() => goto('/trending')}
		>
			<!-- <div class="nav-text">Trending</div> -->
			<Icon
				name="trending"
				color={$page.path.includes('trending') ? '#fff' : '#BCBCBE'}
				size="1.5em"
			/>
		</div>
		<div
			use:tooltip
			data-tooltip="Library"
			class="nav-item btn-favorites"
			class:active={$page.path.includes('library')}
			on:click|stopPropagation={() => {
				goto('/library')
			}}
		>
			<!-- <div class="nav-text">Library</div> -->
			<Icon
				name="folder"
				color={$page.path.includes('library') ? '#fff' : '#BCBCBE'}
				size="1.5em"
			/>
		</div>
	</div>

	<div class="items">
		{#if !hidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					hidden = !hidden
				}}
				class="nav-search"
				transition:fade={{ duration: 75, easing: circIn }}
			>
				<!-- class:hidden={width > 640 || hidden}> -->

				<Search
					type="inline"
					on:submitted={(event) => {
						hidden = !hidden
					}}
				/>
				<div
					on:click={() => {
						hidden = !hidden
					}}
					class="x-button"
				>
					<Icon name="x" size="1.5em" />
				</div>
			</div>
		{/if}

		<div
			class="nav-item__search"
			on:click={() => {
				shown = !shown
				hidden = !hidden
			}}
		>
			<Icon name="search" size="1.5em" />
		</div>
		<div
			use:clickOutside
			on:click_outside={() => {
				isSettingsOpen = false
			}}
			style="display:contents; background:inherit;"
		>
			<Settings bind:isSettingsOpen />
			<div
				class="nav-item btn-settings"
				on:click|stopPropagation={() => {
					isSettingsOpen = !isSettingsOpen
				}}
			>
				<Icon name="settings" size="1.5em" />
			</div>
		</div>
	</div>
</nav>

<style lang="scss">
	.active::before {
		position: absolute;
		top: 50%;
		/* right: 0; */
		/* bottom: 0; */
		left: 50%;
		// content: '';
		border-radius: 9999rem;
		width: 100%;
		height: 100%;
		z-index: -1;
		color: #fff;
		background: radial-gradient(
			circle at center,
			hsl(0deg 0% 85% / 25%),
			hsl(0deg 0% 0% / 0%)
		);
		padding: 1.5rem;
		transform: translate(-50%, -50%);
	}
	-back {
		visibility: visible !important;
		display: block !important;
		@media screen and (max-width: 640px) {
			visibility: none !important;
			display: none !important;
		}
	}
	.logo {
		display: inline-flex;
		align-items: center;
		flex-direction: row-reverse;
		transition: cubic-bezier(0.445, 0.05, 0.55, 0.95) 150ms all;
		&-back {
			visibility: visible !important;
			transition: cubic-bezier(0.445, 0.05, 0.55, 0.95) 150ms all;

			display: block !important;
			@media screen and (max-width: 640px) {
				visibility: none !important;
				display: none !important;
			}
		}
	}
	.btn-settings,
	.btn-favorites {
		cursor: pointer;
		display: block !important;
		visibility: visible !important;
	}
	.middle {
		grid-area: m;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		.nav-item {
			position: relative !important;
			cursor: pointer;
		}
	}
	// .nav-text {
	// 	display: none;
	// 	visibility: hidden;
	// 	@media screen and (min-width: 640px) {
	// 		display: inline;
	// 		visibility: visible;
	// 	}
	// }
	.homeIcon {
		visibility: visible;
		// @media screen and (min-width: 640px) {
		// 	display: none;
		// 	visibility: hidden;
		// }
	}
	nav {
		border-bottom: 0.043128em solid #6d6d6d3a;
		// filter: drop-shadow(0.5rem 1.2rem 1rem #0e0d0d2c);
		// box-shadow: 0 0.2rem 1rem 0.0125rem #0f0f0f38;
		&::before {
			box-shadow: 0 0.4rem 0.2rem -0.0875rem rgba(15, 15, 15, 11%);
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: -1;
			content: '';
		}
		&.light {
			border-bottom: 0.043128em solid #6d6d6d9d;
		}
	}
	.x-button {
		padding: 1em 0 1rem 1rem;
		right: 0;
		margin-left: auto;
		position: relative;
		cursor: pointer;
	}
	.hidden {
		display: none;
		visibility: hidden;
	}
	.shown {
		visibility: visible !important;
	}
	// .desktop {
	// 	visibility: hidden;
	// 	display: none;
	// }

	.nav-item {
		margin-bottom: 0;
		display: initial;
		visibility: visible;
		position: relative;
		.nav-item {
			margin-right: 2em;
		}
		// @media screen and (min-width: 640px) {
		// 	&__search {
		// 		display: none !important;
		// 		visibility: hidden !important;
		// 	}
		// }

		&__search {
			display: initial;
			visibility: visible;

			margin-right: 2rem;
			cursor: pointer;
		}

		&-desktop {
			place-items: end;
		}
	}

	.items {
		background-color: inherit;
		grid-area: r;
		/* align-self: center; */
		/* justify-self: end; */
		display: inline-flex;
		margin-left: auto;
		.nav-item {
			margin-right: 2em;
		}
		:last-child {
			margin-right: 0;
		}
	}
	@media screen and (min-width: 640px) {
		// .btn-settings {
		// 	visibility: hidden;
		// 	display: none;
		// 	cursor: pointer;
		// }
	}
	/* your styles go here */
</style>
