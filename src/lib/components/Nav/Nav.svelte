<script>
	import { browser } from "$app/env";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Icon from "$components/Icon/Icon.svelte";
	import Search from "$components/Search/Search.svelte";
	import { tooltip } from "$lib/actions/tooltip";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { circIn } from "svelte/easing";
	import { fade } from "svelte/transition";
	import Settings from "./Settings.svelte";

	export let key;
	let isHidden = true;
	let hidden = isHidden ? true : false;
	let isSettingsOpen;
	let shown;
	const navBack = () => {
		if (!browser) return;

		window.history.go(-1);
	};
	let referrer;
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
			<a href={`/home`} class="logo-back no-style">
				<img
					style="margin-left:1.5rem;"
					width="32"
					height="32"
					src="/logo.svg"
					alt="logo"
					title="Beatbump Home"
				/>
			</a>
		{:else}
			<a href={`/home`} class="no-style">
				<img
					on:click={() => goto("/home")}
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
			on:click={() => goto("/home")}
			class="nav-icon icon-btn no-style"
			use:tooltip
			data-tooltip="Home"
			aria-label="Home"
			class:active={key.includes("home")}
		>
			<!-- <div class="nav-text">Home</div> -->
			<Icon
				name="home"
				--stroke={key.includes("home") ? "#fff" : "#BCBCBE"}
				size="1.5rem"
			/>
		</button>

		<button
			on:click={() => goto("/trending")}
			class="nav-icon icon-btn no-style"
			use:tooltip
			data-tooltip="Trending"
			aria-label="Trending"
			class:active={key.includes("trending")}
		>
			<Icon
				name="trending"
				--stroke={key.includes("trending") ? "#fff" : "#BCBCBE"}
				size="1.5rem"
			/>
		</button>
		<button
			use:tooltip
			on:click={() => goto("/library")}
			data-tooltip="Library"
			aria-label="library"
			class="nav-icon icon-btn no-style"
			class:active={key.includes("library")}
		>
			<!-- <div class="nav-text">Library</div> -->
			<Icon
				name="folder"
				--stroke={key.includes("library") ? "#fff" : "#BCBCBE"}
				size="1.5rem"
			/>
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
					type="inline"
					on:submitted={() => {
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
			<Settings bind:isSettingsOpen />
			<button
				aria-label="Settings"
				class="nav-item icon-btn btn-settings"
				on:click|stopPropagation={() => {
					isSettingsOpen = !isSettingsOpen;
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

		position: relative;
		grid-template-areas: "l m r";
		min-height: 4rem;
		align-content: center;
		align-items: center;
		justify-content: space-between;
		grid-area: n/n/n/n;
		border-bottom: 0.0625rem hsl(0deg 0% 12%) solid;
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
			max-width: 50%;
			justify-content: safe;
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
			transition: color linear 100ms, background linear 100ms;

			background-position: center;
			padding: 8pt;

			// transition: background 0.8s;
		}
		@media (hover: hover) {
			&:hover::before {
				// background: ;
				background: hsl(0deg 0% 33% / 8%)
					radial-gradient(
						circle,
						hsl(0deg 0% 0% / 0%) 1%,
						hsl(0deg 0% 33% / 16%) 0
					)
					500%/15000%;
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
