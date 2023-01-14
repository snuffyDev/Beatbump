<script lang="ts">
	import Nav from "$components/Nav/Nav.svelte";
	import Player from "$lib/components/Player/Player.svelte";
	import Wrapper from "$lib/components/Wrapper/Wrapper.svelte";
	import Alert from "$lib/components/Alert/Alert.svelte";
	import { showAddToPlaylistPopper } from "$stores/stores";

	import { Popper } from "$lib/components/Popper";

	import PlaylistPopper from "$lib/components/PlaylistPopper";
	import "@fontsource/commissioner/variable.css";

	import { queue } from "$lib/stores/list";
	import Fullscreen from "$lib/components/Player/Fullscreen.svelte";
	import GroupSessionCreator from "$lib/components/GroupSessionCreator";
	import { fullscreenStore } from "$lib/components/Player/channel";
	import { groupSession } from "$lib/stores";
	import { AudioPlayer } from "$lib/player";
	import { page } from "$app/stores";
	import { afterNavigate } from "$app/navigation";
	import observer from "$components/Carousel/observer";
	import { dev } from "$app/environment";
	import SessionListService from "$stores/list/sessionList";
	$: key = $page.data.key;
	let main: HTMLElement;

	let isFullscreen = false;
	$: $fullscreenStore === "open"
		? setTimeout(() => {
				isFullscreen = true;
		  }, 425)
		: setTimeout(() => {
				isFullscreen = false;
		  }, 0);
	$: hasplayer = $queue.length !== 0;

	afterNavigate(() => {
		if (import.meta.env.SSR) return;
		if (main) main.scrollTop = 0;
	});
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
<div
	class="wrapper app-content-m"
	{hasplayer}
	bind:this={main}
	style:overflow-y={$page.route.id === "/search/[slug]" && !$page.url.search.includes("all") ? "hidden" : "auto"}
	id="wrapper"
>
	<Wrapper
		{key}
		{main}
	>
		<slot />
	</Wrapper>
</div>
<PlaylistPopper
	on:close={() => {
		showAddToPlaylistPopper.set({ state: false, item: {} });
	}}
/>
<GroupSessionCreator />
<Alert --alert-bottom={hasplayer ? "5.75em" : "0rem"} />
<Fullscreen state={isFullscreen ? "open" : "closed"} />
<footer
	class="footer-container"
	class:show-player={hasplayer}
>
	<!-- <GroupSessionManager /> -->
	<Player />
</footer>

<style
	lang="scss"
	global
>
	@use "../global/redesign/main.scss" as *;
	.footer-container {
		transition: transform cubic-bezier(0.165, 0.84, 0.44, 1) 350ms, opacity cubic-bezier(0.165, 0.84, 0.44, 1) 350ms;
		opacity: 0;
		transform: translate3d(0, var(--player-bar-height), 0);
	}
	.show-player {
		opacity: 1;
		transform: translate3d(0, 0, 0);
		will-change: transform;
	}
	.wrapper {
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
</style>
