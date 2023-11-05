<script lang="ts">
	import Nav from "$components/Nav/Nav.svelte";
	import Alert from "$lib/components/Alert/Alert.svelte";
	import Player from "$lib/components/Player/Player.svelte";
	import Wrapper from "$lib/components/Wrapper/Wrapper.svelte";
	import { showAddToPlaylistPopper } from "$stores/stores";

	import { Popper } from "$lib/components/Popper";

	import PlaylistPopper from "$lib/components/PlaylistPopper";
	import "@fontsource-variable/commissioner";

	import { browser, dev } from "$app/environment";
	import { afterNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import GroupSessionCreator from "$lib/components/GroupSessionCreator";
	import Fullscreen from "$lib/components/Player/Fullscreen.svelte";
	import { fullscreenStore } from "$lib/components/Player/channel";
	import { AudioPlayer } from "$lib/player";
	import { groupSession, settings } from "$lib/stores";
	import { currentTrack, queue } from "$lib/stores/list";
	import { syncTabs } from "$lib/tabSync.js";
	import { Logger } from "$lib/utils";
	import { SessionListService } from "$stores/list/sessionList";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	export let data;

	$: ({ key } = data);
	let main: HTMLElement;

	let isFullscreen = false;

	$: $fullscreenStore === "open"
		? setTimeout(() => {
				isFullscreen = true;
		  }, 425)
		: setTimeout(() => {
				isFullscreen = false;
		  }, 0);

	let queueAlreadyPopulated = false;

	const setAppHeightWithPlayer = () => {
		if (queueAlreadyPopulated) return true;
		const appElm = document.querySelector<HTMLDivElement>("#app");
		if (appElm) {
			queueAlreadyPopulated = true;
			appElm.style.marginBlockEnd = "var(--player-bar-height)";
		}
		return true;
	};

	$: hasplayer = $queue.length
		? setAppHeightWithPlayer()
		: queueAlreadyPopulated;

	$: if (hasplayer && browser) setAppHeightWithPlayer();
	// Setup dev debugging logs
	$: if (dev && browser) {
		console.log($SessionListService);
		if (page && !window.$page) {
			Object.defineProperty(window, "$page", {
				get() {
					return get(page);
				},
				configurable: true,
			});
		}
	}

	$: if (
		browser &&
		$settings["playback"]["Remember Last Track"] === true &&
		$currentTrack
	) {
		localStorage.setItem("lastTrack", JSON.stringify($currentTrack));
	}

	$: if ($fullscreenStore && browser) {
		$fullscreenStore === "open"
			? document.documentElement.classList.add("no-scroll")
			: document.documentElement.classList.remove("no-scroll");
	}

	afterNavigate(() => {
		if (!browser) return;
		if (main) main.scrollTo({ top: 0 });
	});

	let scrollTop = 0;
	onMount(() => {
		try {
			if (
				$settings["playback"]["Remember Last Track"] &&
				localStorage["lastTrack"]
			) {
				const track = JSON.parse(
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					localStorage.getItem("lastTrack")! as string,
				) as unknown as typeof $currentTrack;

				SessionListService.setTrackWillPlayNext(track, 0);
				SessionListService.getMoreLikeThis({
					playlistId: track?.playlistId ?? track?.autoMixList,
				});
			}
		} catch (err) {
			Logger.err(err);
		}
		syncTabs.connect();
	});
	let info: Record<string, any> = {};
</script>

<svelte:body class={$fullscreenStore === "open" ? "no-scroll" : ""} />
<svelte:window
	on:popstate={() => {
		if (browser) {
			const { state } = history;
			if (state) {
				const { info: _info } = state;
				console.log({ _info, state });
				if (_info) {
					info = _info;
				}
			}
		}
	}}
	on:pagehide={({ persisted }) => {
		if (persisted) return console.log(persisted);
		if (!browser) return;
		if (groupSession.initialized && groupSession.hasActiveSession) {
			groupSession.disconnect();
		}

		AudioPlayer?.dispose?.();
	}}
/>
{#if info}
	<div
		class="info"
		style="position: fixed; z-index: 10000000000; top: 0;
left: 0; background: var(--base-bg); font-size: 1.1rem; display: flex; flex-direction: column;"
	>
		{#each Object.entries(info) as [key, value]}
			<p><strong>{key}</strong> - {value}</p>
		{/each}
	</div>
{/if}
<Nav
	{key}
	--top-bar-width={isFullscreen
		? "calc(100%)"
		: "calc(100% - var(--scrollbar-width) + 0.05em)"}
	bind:fullscreen={isFullscreen}
	bind:opacity={scrollTop}
/>
<Popper {main} />
<div
	class="wrapper app-content-m"
	{hasplayer}
	id="wrapper"
>
	<Wrapper
		on:scrolled={(e) => {
			scrollTop = !e.detail ? 100 : 0;
		}}
		{key}
		bind:main
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
	@import "../global/redesign/main.scss";

	.footer-container {
		transition: transform cubic-bezier(0.165, 0.84, 0.44, 1) 350ms,
			opacity cubic-bezier(0.165, 0.84, 0.44, 1) 350ms;
		opacity: 0;
		will-change: transform;
		transform: translate3d(0, var(--player-bar-height), 0);
	}

	.show-player {
		will-change: initial;
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	.wrapper {
		-webkit-overflow-scrolling: touch;
	}
</style>
