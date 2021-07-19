<script lang="ts">
	import Search from '$components/Search/Search.svelte'
	import { fade } from 'svelte/transition'
	import Icon from '$components/Icon/Icon.svelte'
	import { circIn } from 'svelte/easing'
	import { goto } from '$app/navigation'
	import { clickOutside } from '$lib/js/clickOutside'
	import { filterAutoPlay, theme } from '$stores/stores'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	export let width

	let isHidden = true
	let hidden = isHidden ? true : false
	$: curTheme = $theme
	let isSettings = true
	let settingsHidden = isSettings ? true : false
	let setTheme = localStorage.getItem('theme')
		? localStorage.getItem('theme')
		: ''
	$: setFilter = $filterAutoPlay

	let themeSet = $theme
	$: console.log($page.path)

	let themes = [
		{ name: 'dark' },
		{ name: 'dim' },
		{ name: 'ytm' },
		{ name: 'light' }
	]
	$: console.log(setTheme)
	// $: theme.set($theme)
</script>

<div class="logo">
	<!-- {#if $page.path !== "/trending"}
		<div class="back-button" transition:fade on:click={() => naviBack}>
			<Icon name="chevron-left" size="1.5em" />
		</div>
		{:else} --><a
		href="/trending">
		<img
			src="/logo-header.png"
			width="2.5rem"
			height="0.5rem"
			transition:fade
			alt="logo"
			title="Beatbump Home" />
	</a>
	<!-- {/if} -->
</div>
{#if width > 550}
	<div class="mobile-search">
		<div class="nav-search">
			<Search type="inline" />
		</div>
	</div>
{/if}

<style lang="scss">
	.mobile-search {
		position: absolute;
		background: hsl(0, 0%, 9%);
		width: 100%;
		height: 4rem;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		display: flex;
		flex-direction: row;
	}
</style>
