<script>
	import Search from "$components/Search/Search.svelte";
	import { fade } from "svelte/transition";
	import Icon from "$components/Icon/Icon.svelte";
	import { circIn } from "svelte/easing";
	import { goto } from "$app/navigation";
	import { clickOutside } from "$lib/js/clickOutside";
	import { theme } from "$stores/stores";
	import { onMount } from "svelte";
	import { page } from "$app/stores";

	export let width;

	let isHidden = true;
	let hidden = isHidden ? true : false;
	$: curTheme = $theme;
	let isSettings = true;
	let settingsHidden = isSettings ? true : false;
	let setTheme = $theme;
	// onMount(() => {
	// 	if (!$theme) {
	// 		setTheme = $theme
	// 	} else {
	// 		setTheme = $theme
	// 	}
	// })
	const naviBack = (home = "/trending") => {
		const ref = document.referrer;
		goto(ref.length > 0 ? ref : home);
	};
	let themeSet = $theme;
	$: console.log($page.path);

	let themes = [{ name: "dark" }, { name: "dim" }, { name: "ytm" }];
	// $: theme.set($theme)
</script>

<div class="logo">
	{#if $page.path !== "/trending"}
		<div class="back-button" transition:fade on:click={naviBack}>
			<Icon name="chevron-left" size="1.5em" />
		</div>
	{:else}
		<img
			src="/logo-header.png"
			width="2.5rem"
			height="0.5rem"
			transition:fade
			alt="logo"
			title="Beatbump Home"
			on:click={() => goto("/")} />
	{/if}
</div>
{#if width > 640}
	<div
		style="background:inherit;"
		class:shown={width > 640}
		class:desktop={width < 640}>
		<div
			class="nav-item-desktop"
			on:click={() => {
				settingsHidden = !settingsHidden;
			}}>
			<svelte:component this={Icon} name="settings" size="1.75em" />
		</div>
		{#if !settingsHidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					settingsHidden = !settingsHidden;
				}}
				class="nav-settings"
				style={`background-color: var(--${curTheme}-top)}`}
				transition:fade={{ duration: 120, easing: circIn }}>
				<!-- <label for="search"><em>search</em></label> -->
				<span class="setting">
					<span class="s-text">Theme:</span>
					<div class="selectCont">
						<!-- svelte-ignore a11y-no-onchange -->
						<select
							class="select"
							bind:value={setTheme}
							on:change={() => {
								theme.set(setTheme);
							}}>
							{#each themes as theme}
								<option value={theme.name}>{theme.name}</option>
							{/each}
						</select>
					</div>
				</span>
			</div>
		{/if}
	</div>
{/if}
{#if width < 640}
	<section class="homeIcon" on:click={() => goto("/")}>
		<Icon name="home" size="1.75em" />
	</section>
	<section class="items">
		{#if !hidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					hidden = !hidden;
				}}
				class="nav-search"
				transition:fade={{ duration: 120, easing: circIn }}
				class:hidden>
				<!-- <label for="search"><em>search</em></label> -->
				<Search
					type="inline"
					on:submitted={(event) => {
						hidden = !hidden;
					}} />
				<div
					on:click={() => {
						hidden = !hidden;
					}}
					class="x-button">
					<Icon name="x" size="1.5em" />
				</div>
			</div>
		{/if}
		<div
			class="nav-item"
			on:click={() => {
				hidden = !hidden;
			}}>
			<svelte:component this={Icon} name="search" size="1.75em" />
		</div>
		{#if !settingsHidden}
			<div
				use:clickOutside
				on:click_outside={() => {
					settingsHidden = !settingsHidden;
				}}
				class="nav-settings"
				style={`background-color: var(--${curTheme}-top)}`}
				transition:fade={{ duration: 120, easing: circIn }}>
				<!-- <label for="search"><em>search</em></label> -->
				<span class="setting">
					<span class="s-text">Theme:</span>
					<div class="selectCont">
						<select
							class="select"
							bind:value={setTheme}
							on:blur={() => {
								theme.set(setTheme);
							}}>
							{#each themes as theme}
								<option value={theme.name}>{theme.name}</option>
							{/each}
						</select>
					</div>
				</span>
			</div>
		{/if}
		<div
			class="nav-item"
			on:click={() => {
				settingsHidden = !settingsHidden;
			}}>
			<svelte:component this={Icon} name="settings" size="1.75em" />
		</div>
	</section>
{/if}

<style lang="scss">
	.desktop.nav-item {
		// position: absolute;
		// right: 0;
		// z-index: 5;
	}
	.homeIcon {
		width: 2rem;
		max-width: 2rem;
		display: inline;
	}
	.s-text {
		padding: 0 0.8rem 0.2rem 0.8rem; /* align-self: start; */
		font-size: 1.1rem;
	}
	.x-button {
		padding: 1em;
	}
	.hidden {
		display: none;
	}
	.shown {
		visibility: visible;
		display: block;
	}
	.desktop {
		visibility: hidden;
		display: none;
	}
	.nav-search > :nth-child(2) {
		right: 0;
		position: fixed;
	}
	.nav-item {
		margin-bottom: 0;
		&-desktop {
			place-items: end;
		}
	}
	.nav-settings {
		position: absolute;
		right: 0;
		bottom: -4em;
		display: flex;
		border-top: 0.125px inset hsla(0, 0%, 66.7%, 0.26);
		background-color: inherit;
		padding: 0.5em 0em 0.5em 0;
		z-index: 10;

		border-radius: 0 0rem 0.5rem 0.5rem;
		flex-direction: row;
		width: 100%;
		max-width: 11.4rem;
		max-height: 4rem;
		box-shadow: -0.125rem 0.3rem 0.25rem 0.125rem #00000052;
		border: 0.125px solid #aaaaaa45;
		border-top: 0;

		.setting {
			display: flex;
			flex-wrap: nowrap;
			align-items: center;
			vertical-align: top;
		}
	}

	.items {
		display: flex;
		flex-direction: row;
		background-color: inherit;

		// width: 100%;
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
