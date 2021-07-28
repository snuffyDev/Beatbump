<script>
	import Settings from './Settings.svelte'

	import Search from '$components/Search/Search.svelte'
	import { fade } from 'svelte/transition'
	import Icon from '$components/Icon/Icon.svelte'
	import { circIn } from 'svelte/easing'
	import { goto } from '$app/navigation'
	import { clickOutside } from '$lib/js/clickOutside'
	export let width
	import { theme } from '$stores/stores'
	let isHidden = true
	let hidden = isHidden ? true : false
	let isSettings
	let shown
</script>

<nav class="nav" style={`background-color: var(--${$theme}-top)`}>
	<div class="logo">
		<div on:click={() => goto('/trending')}>
			<img
				src="/logo-header.png"
				width="2.5rem"
				height="0.5rem"
				alt="logo"
				title="Beatbump Home" />
		</div>
		<!-- {/if} -->
	</div>

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
				transition:fade={{ duration: 75, easing: circIn }}
				class:hidden={width > 640 || hidden}>
				<Search
					type="inline"
					on:submitted={(event) => {
						hidden = !hidden
					}} />
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
			class="nav-item__search"
			on:click={() => {
				shown = !shown
				hidden = !hidden
			}}>
			<svelte:component this={Icon} name="search" size="1.75em" />
		</div>
		<Settings bind:isSettings />
		<div
			class:btn-settings-desktop={width > 640}
			class="nav-item btn-settings"
			on:click|stopPropagation={() => {
				isSettings = !isSettings
			}}>
			<svelte:component this={Icon} name="settings" size="1.75em" />
		</div>
	</section>
</nav>

<style lang="scss">
	.btn-settings {
		cursor: pointer;
	}
	.homeIcon {
		grid-area: m;
		visibility: visible;
		justify-self: center;
		justify-content: center;
		margin-left: auto;
		margin-right: auto;
		@media screen and (min-width: 640px) {
			display: none;
			visibility: hidden;
		}
	}
	nav {
		border-bottom: 0.043128em solid #6d6d6d3a;
		// filter: drop-shadow(0.5rem 1.2rem 1rem #0e0d0d2c);
		// box-shadow: 0 0.2rem 1rem 0.0125rem #0f0f0f38;
		&::before {
			box-shadow: 0 0.4rem 0.2rem -0.0875rem rgb(15 15 15 / 11%);
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
		padding: 1em;
		right: 0;
		position: absolute;
	}
	.hidden {
		display: none;
		visibility: hidden;
	}
	.shown {
		visibility: visible !important;
	}
	.desktop {
		visibility: hidden;
		display: none;
	}

	.nav-item {
		margin-bottom: 0;
		display: initial;
		visibility: visible;

		.nav-item {
			margin-right: 1.75em;
		}
		@media screen and (min-width: 640px) {
			&__search {
				display: none !important;
				visibility: hidden !important;
			}
		}

		&__search {
			display: initial;
			visibility: visible;

			margin-right: 1.75rem;
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
			margin-right: 1.75em;
		}
		:last-child {
			margin-right: 0;
		}
	}

	/* your styles go here */
</style>
