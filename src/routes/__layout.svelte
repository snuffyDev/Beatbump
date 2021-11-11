<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	export const load: Load = async ({ page }) => ({
		props: {
			key: page.path
		},
		stuff: { page: page.path }
	})
</script>

<script lang="ts">
	import { browser } from '$app/env'
	import Nav from '$components/Nav/Nav.svelte'
	import Player from '$components/Player/Player.svelte'
	import Wrapper from '$components/Wrapper/Wrapper.svelte'
	import Alert from '$lib/components/Alert/Alert.svelte'
	import {
		alertHandler,
		filterAutoPlay,
		iOS,
		showAddToPlaylistPopper,
		theme
	} from '$stores/stores'
	import { onMount } from 'svelte'
	import { Popper } from '$lib/components/Popper'
	import '../global/stylesheet/main.scss'
	import { settings } from '$lib/stores/settings'
	import PlaylistPopper from '$lib/components/PlaylistPopper'
	export let key
	let main
	onMount(() => {
		iOS.init()
		const filter = localStorage.getItem('filterAutoPlay')
		filter ? filter : localStorage.setItem('filterAutoPlay', 'true')
		settings.set({
			theme: localStorage.getItem('theme'),
			dedupe: JSON.parse(localStorage.getItem('filterAutoPlay')) || true,
			preferWebM: JSON.parse(localStorage.getItem('preferWebM'))
		})
	})
</script>

<Nav {key} />
<div
	class="wrapper"
	class:no-scroll={key.includes('/search/') ? true : false}
	bind:this={main}
	id="wrapper"
>
	<Wrapper {key} {main}>
		<slot />
	</Wrapper>
</div>
<Popper />
<PlaylistPopper
	on:close={() => {
		showAddToPlaylistPopper.set({ state: false, item: {} })
	}}
/>
<Alert />
<footer class="footer-container">
	{#if browser}
		<Player />
	{/if}
</footer>

<style lang="scss" global>
	@import '@fontsource/commissioner/index.css';
	@import '@fontsource/commissioner/500.css';
	@import '@fontsource/commissioner/600.css';
	@import '@fontsource/commissioner/700.css';
</style>
