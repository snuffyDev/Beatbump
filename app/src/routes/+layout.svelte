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
	import { Logger } from "$lib/utils";
	import SessionListService from "$stores/list/sessionList";
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
	$: hasplayer = !queueAlreadyPopulated
		? ((queueAlreadyPopulated = true), $queue.length !== 0)
		: queueAlreadyPopulated;

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

	afterNavigate(() => {
		if (!browser) return;
		if (main) main.scrollTo({ top: 0 });
	});

	onMount(() => {
		try {
			if (
				$settings["playback"]["Remember Last Track"] &&
				localStorage["lastTrack"]
			) {
				const track = JSON.parse(
					localStorage.getItem("lastTrack"),
				) as unknown as typeof $currentTrack;

				SessionListService.setTrackWillPlayNext(track, 0);
				SessionListService.getMoreLikeThis({
					playlistId: track?.playlistId ?? track?.autoMixList,
				});
			}
		} catch (err) {
			Logger.err(err);
		}
	});
	let info: Record<string, any> = {};

	const logInfo = (event: TouchEvent) => {
		["target", "changedTouches"].forEach((prop) =>
			prop === "changedTouches"
				? (info[prop] = JSON.stringify(
						Object.fromEntries(
							["clientX", "clientY"].map((k) => [k, event[prop].item(0)[k]]),
						),
				  ))
				: (info[prop] = event[prop].outerHTML.slice(
						0,
						event[prop].outerHTML.indexOf(">"),
				  )),
		);
		console.log(event.changedTouches);
	};
</script>

<svelte:window
	on:beforeunload={() => {
		if (!browser) return;
		if (groupSession.initialized && groupSession.hasActiveSession) {
			groupSession.disconnect();
		}
		AudioPlayer.dispose();
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
<Nav {key} />
<Popper {main} />
<div
	class="wrapper app-content-m"
	{hasplayer}
	bind:this={main}
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
		transition: transform cubic-bezier(0.165, 0.84, 0.44, 1) 350ms,
			opacity cubic-bezier(0.165, 0.84, 0.44, 1) 350ms;
		opacity: 0;
		will-change: transform;
		transform: translate3d(0, var(--player-bar-height), 0);
	}

	.show-player {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}

	.wrapper {
		-webkit-overflow-scrolling: touch;
	}
</style>
