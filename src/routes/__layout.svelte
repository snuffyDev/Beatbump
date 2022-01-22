<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ url }) => {
		return {
			props: {
				key: url.pathname
			},
			stuff: { page: url.pathname }
		};
	};
</script>

<script lang="ts">
	import Nav from '$components/Nav/Nav.svelte';
	import Player from '$lib/components/Player/Player.svelte';
	import Wrapper from '$components/Wrapper/Wrapper.svelte';
	import Alert from '$lib/components/Alert/Alert.svelte';
	import { iOS, showAddToPlaylistPopper } from '$stores/stores';
	import { onMount } from 'svelte';
	import { Popper } from '$lib/components/Popper';
	import { settings } from '$lib/stores/settings';
	import PlaylistPopper from '$lib/components/PlaylistPopper';
	import '@fontsource/commissioner/400.css';
	import '@fontsource/commissioner/500.css';
	import '@fontsource/commissioner/600.css';
	import '@fontsource/commissioner/700.css';
	import '../global/stylesheet/_layout.scss';
	import '../global/stylesheet/main.scss';

	export let key;
	let main;
	onMount(() => {
		iOS.init();
		const filter = localStorage.getItem('filterAutoPlay');
		filter ? filter : localStorage.setItem('filterAutoPlay', 'true');
		settings.set({
			theme: localStorage.getItem('theme'),
			dedupe: JSON.parse(localStorage.getItem('filterAutoPlay')) || true,
			preferWebM: JSON.parse(localStorage.getItem('preferWebM'))
		});
	});
</script>

<Nav {key} />
<Popper />

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
<PlaylistPopper
	on:close={() => {
		showAddToPlaylistPopper.set({ state: false, item: {} });
	}}
/>
<Alert />
<footer class="footer-container">
	<Player />
</footer>

<style lang="scss" global>
	.wrapper {
		overflow-y: auto; /* has to be scroll, not auto */
		-webkit-overflow-scrolling: touch;
	}
</style>
