<script lang="ts">
	import Nav from "$components/Nav/Nav.svelte";
	import Player from "$lib/components/Player/Player.svelte";
	import Wrapper from "$lib/components/Wrapper/Wrapper.svelte";
	import Alert from "$lib/components/Alert/Alert.svelte";
	import { showAddToPlaylistPopper } from "$stores/stores";

	import { Popper } from "$lib/components/Popper";

	import PlaylistPopper from "$lib/components/PlaylistPopper";
	import "@fontsource/commissioner/variable.css";

	import "../global/stylesheet/_layout.scss";
	import "../global/stylesheet/main.scss";

	import { queue } from "$lib/stores/list";
	import Fullscreen from "$lib/components/Player/Fullscreen.svelte";
	import GroupSessionCreator from "$lib/components/GroupSessionCreator";
	import { fullscreenStore } from "$lib/components/Player/channel";
	import { groupSession } from "$lib/stores";
	import { AudioPlayer } from "$lib/player";
	import { page } from "$app/stores";
	// export let  = "";
	$: key = $page.data.key;
	let main: HTMLElement;
	$: isSearch = key.includes("/search");
	// $: console.log(key);
	let isFullscreen = false;
	$: $fullscreenStore === "open"
		? setTimeout(() => {
				isFullscreen = true;
		  }, 425)
		: setTimeout(() => {
				isFullscreen = false;
		  }, 0);
	$: hasplayer = $queue.length !== 0;
</script>

<svelte:window
	on:beforeunload={() => {
		if (groupSession.initialized && groupSession.hasActiveSession) {
			groupSession.disconnect();
		}
		AudioPlayer.dispose();
	}}
/>
<Nav {key} />
<Popper {main} />
<div class="wrapper app-content-m" {hasplayer} bind:this={main} class:no-scroll={isSearch || isFullscreen} id="wrapper">
	<Wrapper {key} {main}>
		<slot />
	</Wrapper>
</div>
<PlaylistPopper
	on:close={() => {
		showAddToPlaylistPopper.set({ state: false, item: {} });
	}}
/>
<GroupSessionCreator />
<Alert />
<Fullscreen />
<footer class="footer-container" class:show-player={hasplayer}>
	<!-- <GroupSessionManager /> -->
	<Player />
</footer>

<style lang="scss">
	.footer-container {
		transition: transform cubic-bezier(0.165, 0.84, 0.44, 1) 350ms, opacity cubic-bezier(0.165, 0.84, 0.44, 1) 350ms;
		opacity: 0;
		will-change: transform;
		transform: translate3d(0, var(--player-bar-height), 0);
	}
	.show-player {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}
	.wrapper {
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
</style>
