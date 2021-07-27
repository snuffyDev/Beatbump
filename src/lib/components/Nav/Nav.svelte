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
		<div on:click={() => go()}>
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
		max-width: 2rem;
		visibility: visible;
		grid-area: m;
		visibility: visible;
		justify-self: center;
		justify-content: center;
		@media screen and (min-width: 640px) {
			display: none;
			visibility: hidden;
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
		/* margin-left: auto; */
		grid-area: r;
		justify-self: end;
		.nav-item {
			margin-right: 1.75em;
		}
		:last-child {
			margin-right: 0;
		}
	}

	/* your styles go here */
</style>
