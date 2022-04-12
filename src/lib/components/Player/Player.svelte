<script lang="ts">
	import { browser } from "$app/env";
	import { goto } from "$app/navigation";
	import Icon from "$components/Icon/Icon.svelte";
	import db from "$lib/db";
	import { clickOutside } from "$lib/actions/clickOutside";
	import list from "$lib/stores/list";
	import { getSrc } from "$lib/utils/utils";
	import {
		currentTitle,
		key,
		playerLoading,
		showAddToPlaylistPopper,
		updateTrack
	} from "$stores/stores";
	import { tick } from "svelte";

	import { cubicOut } from "svelte/easing";
	import { tweened } from "svelte/motion";
	import { fade } from "svelte/transition";
	import { PopperButton } from "../Popper";
	import Controls from "./Controls.svelte";
	import keyboardHandler from "./keyboardHandler";
	import Queue from "./Queue.svelte";
	import QueueListItem from "./QueueListItem.svelte";
	import { session } from "$app/stores";
	class NodeAudio {
		constructor() {}
		addEventListener(arg0: string, play: any) {
			//
		}
	}
	const player: HTMLAudioElement = browser ? new Audio() : new NodeAudio();
	$: player.autoplay = $updateTrack.url !== null ? true : false;
	// $: player.preload = $updateTrack.url !== null && 'metadata';

	// $: browser && console.log($updateTrack.url, $updateTrack.originalUrl);
	$: player.src = $updateTrack.url !== null ? $updateTrack.url : "";
	$: isWebkit = $session.iOS;
	// $: console.log($list.mix, isWebkit, $session);
	$: autoId = $key;

	$: time = player.currentTime;
	let duration = 0;
	let remainingTime = 0;

	$: volume = 0.5;
	$: player.volume = volume;
	let volumeHover;
	let isPlaying = false;
	let seeking = false;
	let songBar;
	let seekBar;
	let hoverWidth;
	let showing;
	let hovering;
	$: DropdownItems = [
		{
			text: "View Artist",
			icon: "artist",
			action: () => {
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0
				});
				goto(`/artist/${$list.mix[autoId].artistInfo.artist[0].browseId}`);
			}
		},
		{
			text: "Add to Playlist",
			icon: "playlist-add",
			action: async () => {
				showAddToPlaylistPopper.set({ state: true, item: $list.mix[autoId] });
			}
		},
		{
			text: "Add to Favorites",
			icon: "heart",
			action: async () => {
				if (!browser) return;
				await db.setNewFavorite($list.mix[autoId]);
			}
		},
		{
			text: "Shuffle",
			icon: "shuffle",
			action: () => {
				list.shuffle($key, true);
			}
		}
	].filter((item) => {
		{
			if (!$list?.mix[autoId]?.artistInfo?.artist[0]?.browseId) {
				return;
			} else {
				return item;
			}
		}
	});
	let once = false;

	/*
  	Player Controls
	 */
	const play = () => {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.playbackState = "playing";
		}
		isPlaying = true;
	};
	const pause = () => {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.playbackState = "paused";
		}
		isPlaying = false;
		player.pause();
	};
	const setPosition = () => {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.setPositionState({
				duration: isWebkit ? player.duration / 2 : player.duration,
				position: player.currentTime
			});
		}
	};

	/*
		Player Event Listeners
	 */

	player.addEventListener("loadedmetadata", () => {
		setPosition();
		isPlaying = true;
		window.bbPlayer = {
			src: $updateTrack.originalUrl,
			duration: player.duration,
			title: $list.mix[autoId].title
		};

		metaDataHandler();
	});

	player.addEventListener("timeupdate", () => {
		time = player.currentTime;
		duration = player.duration;
		remainingTime = duration - time;
		if (document.visibilityState !== "hidden") {
			$progress = isWebkit == true ? time * 2 : time;
		}
		/* This checks if the user is on an iOS device
		 	 due to the length of a song being doubled on iOS,
			 we have to cut the time in half. Doesn't effect other devices.
		*/
		if (isWebkit && remainingTime <= duration / 2 && once == false) {
			player.currentTime = player.currentTime * 2;
		}
	});
	player.addEventListener("pause", () => {
		isPlaying = false;
		pause();
	});

	player.addEventListener("play", () => play());

	player.addEventListener("ended", () => getNext());

	player.addEventListener("seeked", () => {
		if (!isPlaying) return;
		play();
	});

	/*
		Metadata Handler
	*/
	function metaDataHandler() {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: $list.mix[autoId]?.title,
				artist: $list.mix[autoId]?.artistInfo?.artist[0].text || null,
				album: $list.mix[autoId]?.album?.title ?? undefined,
				artwork: [
					{
						src:
							$list.mix[autoId]?.thumbnails[
								$list.mix[autoId]?.thumbnails.length - 1
							].url,
						sizes: `${
							$list.mix[autoId]?.thumbnails[
								$list.mix[autoId]?.thumbnails.length - 1
							].width
						}x${
							$list.mix[autoId]?.thumbnails[
								$list.mix[autoId]?.thumbnails.length - 1
							].height
						}`,
						type: "image/jpeg"
					}
				]
			});
			navigator.mediaSession.setActionHandler("play", (session) => {
				const _play = player.play();

				if (_play !== undefined) {
					_play
						.then(() => {
							play();
						})
						.catch((error) => {
							console.error(error);
						});
				}
			});
			navigator.mediaSession.setActionHandler("pause", pause);
			navigator.mediaSession.setActionHandler("seekto", (session) => {
				if (session.fastSeek && "fastSeek" in player) {
					player.fastSeek(session.seekTime);
					setPosition();
					return;
				}
				player.currentTime = session.seekTime;
				setPosition();
			});
			navigator.mediaSession.setActionHandler("previoustrack", prevBtn);
			navigator.mediaSession.setActionHandler("nexttrack", () => getNext());
		}
	}
	/*
		Player Track Management
	*/

	async function getNext() {
		once = true;

		if (autoId == $list.mix.length - 1) {
			if (!$list.continuation && !$list.clickTrackingParams) {
				autoId++;
				key.set(autoId);
				await list.getMoreLikeThis($list.mix[$list.mix.length - 1]);
				await tick();
				getTrackURL();

				once = false;
				return;
			}
			list.getSessionContinuation({
				itct: $list.mix[autoId]?.itct,
				videoId: $list.mix[autoId]?.videoId,
				playlistId: $list.currentMixId,
				ctoken: $list.continuation,
				clickTrackingParams: $list.clickTrackingParams,
				key: autoId + 1
			});
			autoId++;
			key.set(autoId);
			once = false;
		} else {
			try {
				autoId++;
				key.set(autoId);
				getTrackURL();
				once = false;
			} catch (error) {
				console.error("Error!", error);
			}
		}
	}

	async function getTrackURL(): Promise<string> {
		return getSrc($list.mix[autoId].videoId)
			.then(({ body, error }) => {
				if (error === true) {
					getNext();
					return error;
				}
				currentTitle.set($list.mix[autoId].title);
				return body;
			})
			.catch((err) => {
				console.error("URL Error! " + err);
				return err;
			});
	}

	function prevBtn() {
		if (!autoId || autoId < 0) {
			console.log("cant do that!");
		} else {
			autoId--;
			key.set(autoId);
			getTrackURL();
		}
	}

	/*
		UI Functions
	*/
	const progress = tweened(0, {
		duration: duration,
		easing: cubicOut
	});
	function trackMouse(event) {
		if (seeking) seekAudio(event);
		if (hovering) hoverEvent(event);
	}
	function seek(event, bounds) {
		let x = event.pageX - bounds.left;

		return Math.min(Math.max(x / bounds.width, 0), 1);
	}
	function hoverEvent(event) {
		if (!songBar) return;
		hoverWidth = hover(event, songBar.getBoundingClientRect());
	}
	function hover(event, bounds) {
		let x = event.clientX + bounds.left;
		return Math.min(Math.max(x / bounds.width, 0), 1);
	}

	function seekAudio(event) {
		if (!songBar && isPlaying === false) return;

		player.currentTime =
			seek(event, songBar.getBoundingClientRect()) * duration;
		player.currentTime =
			isWebkit == true
				? (seek(event, songBar.getBoundingClientRect()) * duration) / 2
				: seek(event, songBar.getBoundingClientRect()) * duration;
	}

	const shortcut = {
		Comma: () => {
			prevBtn();
		},
		Period: () => {
			getNext();
		},
		Space: () => {
			if (!player && !player.src) return;
			if (!isPlaying) {
				const _play = player.play();
				if (_play !== undefined) {
					_play
						.then(() => {
							play();
						})
						.catch((error) => {
							console.error(error);
						});
				} else {
					player.play();
				}
			} else {
				pause();
			}
		}
	};
</script>

<svelte:window
	on:pointerup={() => (seeking = false)}
	on:pointermove={trackMouse}
/>
<div
	class="progress-bar"
	transition:fade
	on:click={seekAudio}
	on:pointerdown={() => {
		seeking = false;
		hovering = false;
	}}
	on:pointerup={() => {
		seeking = false;
		hovering = false;
	}}
	on:pointerleave={(event) => {
		hovering = false;
	}}
	on:pointerenter={(e) => {
		hovering = true;
	}}
>
	{#if hovering}
		<div
			class="hover"
			transition:fade={{ duration: 150 }}
			style="transform:scaleX({hoverWidth})"
		/>
	{/if}
	<progress bind:this={songBar} value={$progress} max={duration} />
</div>
<div class="player" use:keyboardHandler={{ shortcut }}>
	<div
		style="background:inherit;"
		on:click_outside={() => {
			showing = false;
		}}
		use:clickOutside
		class="player-left"
	>
		{#if showing}
			<Queue
				bind:autoId={$key}
				on:close={({ detail }) => (showing = detail.showing)}
				let:ctxKey
				{showing}
				let:item
				let:index
			>
				<row id={index}>
					<QueueListItem
						{ctxKey}
						on:removeItem={async () => {
							showing = true;
							if (index == $key) {
								key.set(index - 1);
								await tick();
								getNext();
							}
						}}
						on:updated={async (event) => {
							key.set(index - 1);
							await tick();
							getNext();
						}}
						{item}
						{index}
					/>
				</row>
			</Queue>
		{/if}
		<div
			on:click={() => {
				if (showing) {
					showing = false;
				} else {
					showing = true;
				}
			}}
			class="listButton player-btn"
		>
			<Icon color="white" name="radio" size="2rem" />
		</div>
	</div>
	<Controls
		bind:isPlaying
		bind:loading={$playerLoading}
		on:play={() => {
			play();
			player.play();
		}}
		{pause}
		nextBtn={() => {
			if ($list.mix.length === 0) return;
			getNext();
		}}
		{prevBtn}
	/>
	<div class="player-right">
		<div
			class="volume "
			use:clickOutside
			on:click_outside={() => (volumeHover = false)}
		>
			<div
				color="white"
				class="volume-icon player-btn"
				on:click={() => (volumeHover = !volumeHover)}
			>
				<Icon color="white" name="volume" size="2rem" />
			</div>
			{#if volumeHover}
				<div class="volume-wrapper">
					<div class="volume-slider">
						<input
							class="volume"
							type="range"
							bind:value={volume}
							min="0"
							max="1"
							step="any"
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
	<div class="menu-container">
		<PopperButton
			tabindex="-1"
			type="player"
			size="2rem"
			items={DropdownItems}
		/>
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_player.scss";

	row {
		position: relative;
	}
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}

	.volume {
		position: relative;
		will-change: visibility, display;
		@media screen and (max-width: 500px) {
			visibility: hidden;
			display: none;
		}
	}
	.hover {
		background-color: #bababa66;
		height: 0.5rem;
		position: absolute;
		z-index: 1;
		width: 100%;
		transform-origin: 0% 50%;
	}

	.player {
		background-color: inherit;
	}
	.volume-wrapper {
		background: var(--dark-bottom);
		display: flex;

		position: absolute;
		bottom: 6.5rem;
		transform: rotate(-90deg);
		padding: 0 0.4rem;
		height: 1.3rem;
		border-radius: 0.6rem;
	}
	.volume-slider {
		height: 100%;
		display: flex;
		align-items: center;
	}
	.volume-icon {
		cursor: pointer;
	}

	.menu-container {
		padding: 0;
		position: relative;
		will-change: position;
		margin-right: 8%;
		grid-area: r;
		place-self: flex-end;
		align-self: center;
		@media screen and (max-width: 500px) {
			position: relative !important;
			place-self: center;
		}
	}
	.progress-bar {
		position: relative;
		grid-row: p;
		width: 100%;
		will-change: visibility;
		height: 100%;
		background-color: #232530;
	}
	.player-left,
	.player-right {
		align-self: center;
		height: auto;

		place-self: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.player-left {
		grid-area: l;
	}
	.player-right {
		grid-area: r;
	}
	progress {
		display: block;
		width: 100%;
		height: inherit;
		top: 0;
		cursor: pointer;
		margin: 0;
		-moz-appearance: none;
		appearance: none;
		background: transparent;
		outline: none;
		border: transparent;
		padding: 0;
		will-change: contents;
		isolation: isolate;
		&::before {
			background-color: #232530;
			position: absolute;
			inset: 0;
			content: "";
			width: 100%;
			z-index: -1;
		}
	}

	progress::-webkit-progress-bar {
		background-color: #232530;
	}
	progress::-moz-progress-bar {
		background-color: #f3f3f3;
		color: white;
	}
	progress::-webkit-progress-value {
		background-color: rgba(255, 255, 255, 0.8);
	}

	@media screen and (min-width: 500px) {
		// .menu-container__desktop {
		// 	visibility: none !important;
		// 	display: none !important;
		// 	will-change: visibility, display;
		// }
	}
</style>
