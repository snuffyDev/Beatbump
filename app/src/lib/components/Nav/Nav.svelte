<svelte:options immutable={true} />

<script>
	import { browser } from "$app/env";
	import { goto } from "$app/navigation";
	import Icon from "$components/Icon/Icon.svelte";
	import Search from "$components/Search/Search.svelte";
	import { tooltip } from "$lib/actions/tooltip";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { circIn } from "svelte/easing";
	import { fade } from "svelte/transition";
	import Settings from "./Settings.svelte";
	import { fullscreenStore } from "../Player/channel";
	import { preserveSearch } from "$lib/stores";
	import { searchFilter } from "../Search/options";

	export let key;
	let isHidden = true;
	let hidden = isHidden ? true : false;
	let isSettingsOpen;
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
			<div
				class="logo"
				style="
			cursor: pointer;
			"
				on:click={navBack}
			>
				<Icon name="chevron-left" size="1.5rem" />
			</div>
			<a
				href={`/home`}
				on:click={() => {
					$fullscreenStore && fullscreenStore.set("closed");
				}}
				class="logo-back no-style"
			>
				<img style="margin-left:1.5rem;" width="32" height="32" src="/logo.svg" alt="logo" title="Beatbump Home" />
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
			<!-- <div class="nav-text">Home</div> -->
			<Icon name="home" --stroke={key.includes("home") ? "#fff" : "#BCBCBE"} size="1.5rem" />
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
			<Icon name="trending" --stroke={key.includes("trending") ? "#fff" : "#BCBCBE"} size="1.5rem" />
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
			<!-- <div class="nav-text">Library</div> -->
			<Icon name="folder" --stroke={key.includes("library") ? "#fff" : "#BCBCBE"} size="1.5rem" />
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
				transition:fade={{ duration: 75, easing: circIn }}
			>
				<!-- class:hidden={width > 640 || hidden}> -->
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
					<Icon name="x" size="1.5rem" />
				</button>
			</div>
			<div
				class="backdrop"
				style:z-index={1}
				style:background={"linear-gradient(    to bottom,    hsla(0, 0%, 0%, 0.96) 0%,    hsla(0, 0%, 0.72%, 0.918) 4.9%,    hsla(0, 0%, 1.39%, 0.879) 9.9%,    hsla(0, 0%, 2.01%, 0.843) 15.1%,    hsla(0, 0%, 2.59%, 0.809) 20.5%,    hsla(0, 0%, 3.12%, 0.778) 26.1%,    hsla(0, 0%, 3.6%, 0.75) 32%,    hsla(0, 0%, 4.04%, 0.725) 38.2%,    hsla(0, 0%, 4.43%, 0.702) 44.6%,    hsla(0, 0%, 4.78%, 0.681) 51.4%,    hsla(0, 0%, 5.08%, 0.663) 58.5%,    hsla(0, 0%, 5.35%, 0.648) 66%,    hsla(0, 0%, 5.57%, 0.635) 73.9%,    hsla(0, 0%, 5.75%, 0.624) 82.1%,    hsla(0, 0%, 5.9%, 0.616) 90.8%,    hsla(0, 0%, 6%, 0.61) 100%  )"}
				transition:fade={{ duration: 75, easing: circIn }}
			/>
		{/if}

		<button
			class="nav-item icon-btn nav-item__search"
			on:click={() => {
				shown = !shown;
				hidden = !hidden;
			}}
			aria-label="Search"
		>
			<Icon name="search" size="1.5rem" />
		</button>
		<div
			use:clickOutside
			on:click_outside={() => {
				isSettingsOpen = false;
			}}
			style="display:contents; background:inherit;"
		>
			<!-- <Settings bind:isSettingsOpen /> -->
			<button
				aria-label="Settings"
				class="nav-item icon-btn btn-settings"
				on:click|stopPropagation={() => {
					goto("/settings");
					// isSettingsOpen = !isSettingsOpen;
				}}
			>
				<Icon name="settings" size="1.5rem" />
			</button>
		</div>
	</div>
</nav>

<style lang="scss">
	nav {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		padding: 1rem;

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
		isolation: isolate;
		justify-content: space-between;
		border-bottom: 0.0625rem hsl(0deg 0% 12%) solid;
	}
	.x-button {
		position: absolute;
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
		/* align-self: center; */
		/* justify-self: end; */
		display: inline-flex;
		margin-left: auto;
		.nav-item {
			margin-right: 0.2em;
		}
		:last-child {
			margin: 0;
		}
	}

	button.icon-btn {
		&::before {
			position: absolute;
			content: "";
			// z-index: -1;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			height: 100%;
			width: 100%;
			border-radius: 50%;
			opacity: 0;
			transition: color linear 100ms, background linear 500ms !important;

			background-position: center;
			padding: 8pt;

			background-size: 50%;
			background: rgba(84, 84, 84, 0) radial-gradient(circle, hsl(0deg 0% 0% / 0%) 1%, hsl(0deg 0% 33% / 16%) 0) 500%/15000% !important;
			transition: background 0.8s;
		}
		@media (hover: hover) {
			&:hover::before {
				// background: ;
				background-size: 150%;
				background: hsl(0deg 0% 33% / 8%) radial-gradient(circle, hsl(0deg 0% 0% / 0%) 1%, hsl(0deg 0% 33% / 16%) 0)
					500%/15000% !important;
				opacity: 1;
			}
		}
		&:active::before {
			background-size: 100%;
			background-color: #7272723f;
			transition: background 0;
		}
	}
</style>
