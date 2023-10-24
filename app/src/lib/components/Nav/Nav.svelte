<svelte:options immutable={true} />

<script>
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import Icon from "$components/Icon/Icon.svelte";
	import Search from "$components/Search/Search.svelte";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { tooltip } from "$lib/actions/tooltip";
	import { preserveSearch } from "$lib/stores";
	import { circOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import { fullscreenStore } from "../Player/channel";
	import { searchFilter } from "../Search/options";

	export let key;
	export let opacity = 0;
	export let fullscreen = false;

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

	$: console.log({ opacity });
</script>

<svelte:body class={!hidden ? "no-scroll" : ""} />

<nav
	class="nav"
	class:scrolled={opacity >= 100 || fullscreen}
>
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
				<Icon
					name="chevron-left"
					size="1.6125em"
				/>
			</button>
			<a
				href={`/home`}
				on:click={() => {
					$fullscreenStore && fullscreenStore.set("closed");
				}}
				class="logo-back no-style"
			>
				<img
					style="margin-left:1em;"
					width="32"
					height="32"
					src="/logo.svg"
					alt="logo"
					title="Beatbump Home"
				/>
			</a>
		{:else}
			<a
				href={`/home`}
				class="no-style"
			>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
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
			<Icon
				name="home"
				--stroke={key.includes("home") ? "#fff" : "#BCBCBE"}
				size="1.6125em"
			/>
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
			<Icon
				name="trending"
				--stroke={key.includes("trending") ? "#fff" : "#BCBCBE"}
				size="1.6125em"
			/>
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
			<Icon
				name="folder"
				--stroke={key.includes("library") ? "#fff" : "#BCBCBE"}
				size="1.6125em"
			/>
		</button>
	</div>

	<div class="items">
		<button
			class="icon-btn nav-item__search"
			on:click={() => {
				shown = !shown;
				hidden = !hidden;
				fullscreenStore.set("closed");
			}}
			aria-label="Search"
		>
			<Icon
				name="search"
				size="1.6125em"
			/>
		</button>

		<button
			aria-label="Settings"
			class="icon-btn btn-settings"
			on:click={() => {
				$fullscreenStore && fullscreenStore.set("closed");
				goto("/settings", {});
			}}
		>
			<Icon
				name="settings"
				size="1.6125em"
			/>
		</button>
	</div>
</nav>

{#if !hidden}
	<button
		class="sr-only"
		on:click={() => {
			hidden = !hidden;
		}}>Close Search Dialogue</button
	>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="backdrop"
		on:click|stopPropagation|preventDefault
		style:z-index={500}
		transition:fade|global={{ duration: 400, easing: circOut }}
	>
		<div
			use:clickOutside
			on:click_outside={() => {
				hidden = !hidden;
			}}
			class="nav-search"
			in:fade|global={{ delay: 200, duration: 200, easing: circOut }}
			out:fade|global={{ duration: 200, easing: circOut }}
		>
			<Search
				{filter}
				{query}
				type="inline"
				on:submitted={({ detail }) => {
					if (preserve.includes("Category")) {
						filter = detail?.filter;
					}
					if (preserve.includes("Query")) {
						query = detail?.query;
					}
					hidden = !hidden;
				}}
			/>
		</div>
	</div>
{/if}

<style lang="scss">
	nav {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		padding-inline: 0.6em;
		padding-inline-end: 1.2em;
		position: absolute;

		top: 0;
		left: 0;
		width: var(--top-bar-width, calc(100% - var(--scrollbar-width) + 0.05em));
		@media screen and (max-width: 720px) {
			width: 100vw;
		}

		// padding-right: var(--scrollbar-width);
		grid-template-areas: "l m r";
		height: var(--top-bar-height);
		align-content: center;
		align-items: center;
		touch-action: none;
		z-index: 150;
		background-color: var(--base-bg-opacity-1_2) !important;
		justify-content: space-between;
		transition: 150ms cubic-bezier(0.215, 0.61, 0.355, 1);
		transition-delay: 200ms;
		&.scrolled::before {
			border-color: hsla(0, 0%, 91%, 0.174);
		}
		&::before {
			content: "";
			position: absolute;
			inset: 0;
			z-index: -1;
			opacity: 0.1;
			border-bottom: 0.0625rem hsla(0, 0%, 91%, 0.174) solid;
			border-color: hsla(0, 0%, 91%, 0.023);

			transition: 300ms cubic-bezier(0.215, 0.61, 0.355, 1);
			transition-property: opacity, background-color, box-shadow, border;
			transition-delay: 100ms;
			box-shadow: 0 -0.5rem 62px -32px #000 inset;
			background-color: #0000;
		}
		&.scrolled::before {
			box-shadow: 0 -0.5rem 62px -32px #0000 inset;
			transition-delay: 0ms;
			opacity: 1;
			background-color: var(--top-bg);
		}

		@media screen and (min-width: 720px) {
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
		position: fixed;
		inset: 0;
		overflow-y: hidden;
		touch-action: none;
		background: linear-gradient(
			to bottom,
			hsl(0deg 0% 3% / 94%) 0%,
			hsl(0deg 0% 2.96% / 93.7%) 3.3%,
			hsl(0deg 0% 2.86% / 92.7%) 7.1%,
			hsl(0deg 0% 2.69% / 91.1%) 11.4%,
			hsl(0deg 0% 2.48% / 89.2%) 16.2%,
			hsl(0deg 0% 2.24% / 86.9%) 21.5%,
			hsl(0deg 0% 1.96% / 84.3%) 27.3%,
			hsl(0deg 0% 1.67% / 81.6%) 33.6%,
			hsl(0deg 0% 1.37% / 78.8%) 40.3%,
			hsl(0deg 0% 1.08% / 76.1%) 47.5%,
			hsl(0deg 0% 0.8% / 73.5%) 55.2%,
			hsl(0deg 0% 0.55% / 71.2%) 63.3%,
			hsl(0deg 0% 0.34% / 69.1%) 71.8%,
			hsl(0deg 0% 0.16% / 67.5%) 80.8%,
			hsl(0deg 0% 0.05% / 66.5%) 90.2%,
			hsl(0deg 0% 0% / 66%) 100%
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
			background: rgb(255 255 255 / 20%)
				radial-gradient(circle, rgb(255 255 255 / 40%) 1%, #0000 1%)
				center/15000%;
			z-index: 1;
			box-shadow: -2px -2px 22px -4px rgb(0 0 0 / 20.8%) inset,
				-2px -2px 33px -12px rgb(0 0 0 / 30.8%) inset,
				2px 2px 33px -12px rgb(0 0 0 / 30.8%) inset;
			width: 100%;
			height: 100%;
			margin-top: -50%;
			margin-left: -50%;
			top: 50%;
			left: 50%;
			transition-duration: 700ms;
			// transform: scale(1);transform
			transition-timing-function: linear;
			transition-property: background-color, opacity, box-shadow;
			opacity: 0;
		}

		&:hover::after {
		}

		@media (hover: hover) {
			&:hover:not(:active, :focus-visible)::before {
				opacity: 0.2;
				box-shadow: -2px -2px 22px -8px rgb(0 0 0 / 20.8%) inset,
					-2px -2px 26px -12px rgb(0 0 0 / 30.8%) inset,
					2px 2px 33px -14px rgb(0 0 0 / 30.8%) inset;
				background-color: rgb(255 255 255 / 20%) !important;
				// transform: scale(1);transform
			}
		}

		&:active:hover::before {
			opacity: 0.7;
			transition: 0s !important;
			box-shadow: -2px -2px 22px -4px rgb(0 0 0 / 20.8%) inset,
				-2px -2px 33px -12px rgb(0 0 0 / 30.8%) inset,
				2px 2px 33px -12px rgb(0 0 0 / 30.8%) inset;
			background-size: 150%;
			// transform: scale(1);transform
		}
	}
</style>
