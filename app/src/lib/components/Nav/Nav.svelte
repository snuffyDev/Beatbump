<svelte:options immutable={true} />

<script>
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import Icon from "$components/Icon/Icon.svelte";
	import Search from "$components/Search/Search.svelte";
	import { tooltip } from "$lib/actions/tooltip";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { ripple } from "$lib/actions/ripple";
	import { circIn } from "svelte/easing";
	import { fade } from "svelte/transition";
	import { fullscreenStore } from "../Player/channel";
	import { preserveSearch } from "$lib/stores";
	import { searchFilter } from "../Search/options";

	export let key;
	let isHidden = true;
	let hidden = isHidden ? true : false;

	let shown;
	$: preserve = $preserveSearch;
	let query = "";
	let filter = searchFilter[0].params;
	const navBack = () => {
		if (!browser) return;
		$fullscreenStore && fullscreenStore.set("closed");

		window.history.go(-1);
	};
</script>

<nav class="nav">
	<div class="logo">
		{#if !key.includes("home")}
			<button
				on:click={() => {
					$fullscreenStore && fullscreenStore.set("closed");
					navBack();
				}}
				class="nav-icon icon-btn no-style"
				aria-label="Back"
			>
				<Icon name="chevron-left" size="1.6125em" />
			</button>
			<a
				href={`/home`}
				on:click={() => {
					$fullscreenStore && fullscreenStore.set("closed");
				}}
				class="logo-back no-style"
			>
				<img style="margin-left:1em;" width="32" height="32" src="/logo.svg" alt="logo" title="Beatbump Home" />
			</a>
		{:else}
			<a href={`/home`} class="no-style">
				<img
					on:click={() => {
						$fullscreenStore && fullscreenStore.set("closed");
						goto("/home");
					}}
					width="32"
					height="32"
					src="/logo.svg"
					alt="logo"
					title="Beatbump Home"
				/>
			</a>
		{/if}
	</div>

	<div class="middle">
		<button
			on:click={() => {
				$fullscreenStore && fullscreenStore.set("closed");
				goto("/home");
			}}
			class="nav-icon icon-btn no-style"
			use:tooltip
			data-tooltip="Home"
			aria-label="Home"
			class:active={key.includes("home")}
		>
			<Icon name="home" --stroke={key.includes("home") ? "#fff" : "#BCBCBE"} size="1.6125em" />
		</button>

		<button
			on:click={() => {
				$fullscreenStore && fullscreenStore.set("closed");
				goto("/trending");
			}}
			class="nav-icon icon-btn no-style"
			use:tooltip
			data-tooltip="Trending"
			aria-label="Trending"
			class:active={key.includes("trending")}
		>
			<Icon name="trending" --stroke={key.includes("trending") ? "#fff" : "#BCBCBE"} size="1.6125em" />
		</button>
		<button
			use:tooltip
			on:click={() => {
				$fullscreenStore && fullscreenStore.set("closed");
				goto("/library");
			}}
			data-tooltip="Library"
			aria-label="library"
			class="nav-icon icon-btn no-style"
			class:active={key.includes("library")}
		>
			<Icon name="folder" --stroke={key.includes("library") ? "#fff" : "#BCBCBE"} size="1.6125em" />
		</button>
	</div>

	<div class="items">
		{#if !hidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					hidden = !hidden;
				}}
				class="nav-search"
				in:fade={{ delay: 200, duration: 200, easing: circIn }}
				out:fade={{ duration: 200, easing: circIn }}
			>
				<Search
					{filter}
					{query}
					type="inline"
					on:submitted={({ detail }) => {
						console.log(detail);
						if (preserve.includes("Category")) {
							filter = detail?.filter;
						}
						if (preserve.includes("Query")) {
							query = detail?.query;
						}
						hidden = !hidden;
					}}
				/>
				<button
					on:click={() => {
						hidden = !hidden;
					}}
					class="icon-btn x-button"
					aria-label="close"
				>
					<Icon name="x" size="1.6125em" />
				</button>
			</div>
			<div class="backdrop" style:z-index={1} transition:fade={{ duration: 400, easing: circIn }} />
		{/if}

		<button
			class="icon-btn nav-item__search"
			on:click={() => {
				shown = !shown;
				hidden = !hidden;
				fullscreenStore.set("closed");
			}}
			aria-label="Search"
		>
			<Icon name="search" size="1.6125em" />
		</button>

		<button
			aria-label="Settings"
			class="icon-btn btn-settings"
			on:click={() => {
				$fullscreenStore && fullscreenStore.set("closed");
				goto("/settings", {});
			}}
		>
			<Icon name="settings" size="1.6125em" />
		</button>
	</div>
</nav>

<style lang="scss">
	nav {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		padding-inline: 0.75em;

		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		min-width: 100vw;

		grid-template-areas: "l m r";
		height: var(--top-bar-height);
		align-content: center;
		align-items: center;
		touch-action: none;
		z-index: 150;
		background-color: var(--top-bg);
		// isolation: isolate;
		justify-content: space-between;
		border-bottom: 0.0625rem hsl(0deg 0% 12%) solid;
		@media screen and (min-width: 640px) {
			z-index: 155;
		}
	}
	.x-button {
		position: absolute !important;
		top: 0.8em;
		right: 1em;
	}
	img {
		width: 2.5rem;
		height: 2.5rem;
	}
	.logo {
		grid-area: l;
		display: inline-flex;
		align-items: center;
		&-back {
			visibility: visible !important;
			display: block !important;
			@media screen and (max-width: 640px) {
				visibility: none !important;
				display: none !important;
			}
		}
	}
	.middle {
		position: relative;
		margin: 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		grid-area: m;
		width: 100%;
		gap: 0.275rem;

		@media screen and (min-width: 640px) {
			max-width: 75%;
			justify-content: space-evenly;
		}
	}
	.items {
		grid-area: r;

		display: inline-flex;
		margin-left: auto;
		.nav-item {
			margin-right: 0.2em;
		}
		:last-child {
			margin: 0;
		}
	}

	.backdrop {
		background: linear-gradient(
			to bottom,
			hsla(0, 0%, 3%, 0.94) 0%,
			hsla(0, 0%, 2.96%, 0.937) 3.3%,
			hsla(0, 0%, 2.86%, 0.927) 7.1%,
			hsla(0, 0%, 2.69%, 0.911) 11.4%,
			hsla(0, 0%, 2.48%, 0.892) 16.2%,
			hsla(0, 0%, 2.24%, 0.869) 21.5%,
			hsla(0, 0%, 1.96%, 0.843) 27.3%,
			hsla(0, 0%, 1.67%, 0.816) 33.6%,
			hsla(0, 0%, 1.37%, 0.788) 40.3%,
			hsla(0, 0%, 1.08%, 0.761) 47.5%,
			hsla(0, 0%, 0.8%, 0.735) 55.2%,
			hsla(0, 0%, 0.55%, 0.712) 63.3%,
			hsla(0, 0%, 0.34%, 0.691) 71.8%,
			hsla(0, 0%, 0.16%, 0.675) 80.8%,
			hsla(0, 0%, 0.05%, 0.665) 90.2%,
			hsla(0, 0%, 0%, 0.66) 100%
		) !important;
	}

	button.icon-btn {
		border-radius: 50%;

		background: #0000;

		position: relative;
		&::before {
			content: "";
			position: absolute;
			border-radius: 50%;

			overflow: hidden;
			background: rgba(255, 255, 255, 0.2) radial-gradient(circle, rgba(255, 255, 255, 0.4) 1%, #0000 1%) center/15000%;

			z-index: 1;
			box-shadow: -2px -2px 22px -4px rgba(0, 0, 0, 0.208) inset, -2px -2px 33px -12px rgba(0, 0, 0, 0.308) inset,
				2px 2px 33px -12px rgba(0, 0, 0, 0.308) inset;

			width: 100%;
			height: 100%;

			margin-top: -50%;
			margin-left: -50%;

			top: 50%;
			left: 50%;
			transition-duration: 700ms;
			// transform: scale(1);
			transition-timing-function: linear;
			transition-property: background-color, opacity, box-shadow;
			opacity: 0;
		}
		&:hover::after {
		}
		@media (hover: hover) {
			&:hover:not(:active):not(:focus-visible)::before {
				opacity: 0.2;

				box-shadow: -2px -2px 22px -8px rgba(0, 0, 0, 0.208) inset, -2px -2px 26px -12px rgba(0, 0, 0, 0.308) inset,
					2px 2px 33px -14px rgba(0, 0, 0, 0.308) inset;

				background-color: rgba(255, 255, 255, 0.2) !important;
				// transform: scale(1);
			}
		}

		&:active:hover::before {
			opacity: 0.7;
			transition: 0s !important;
			box-shadow: -2px -2px 22px -4px rgba(0, 0, 0, 0.208) inset, -2px -2px 33px -12px rgba(0, 0, 0, 0.308) inset,
				2px 2px 33px -12px rgba(0, 0, 0, 0.308) inset;

			background-size: 150%;
			// transform: scale(1);
		}
	}
</style>
