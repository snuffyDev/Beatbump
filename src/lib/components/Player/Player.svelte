<script>
	import { clickOutside } from "$lib/js/clickOutside";
	import { goto } from "$app/navigation";
	import Dropdown from "$components/Dropdown/Dropdown.svelte";
	import { iOS } from "$stores/stores.js";
	import { tweened } from "svelte/motion";
	import { getSrc } from "$lib/utils";
	import Queue from "./Queue.svelte";
	import "../../../global/scss/components/_player.scss";
	import Icon from "$components/Icon/Icon.svelte";
	import { updateTrack, key, currentMix, currentTitle } from "$stores/stores";
	import { cubicOut } from "svelte/easing";
	import * as utils from "$lib/utils";
	import list from "$lib/stores/list";

	export let title;
	export let nowPlaying;

	const player = new Audio();
	$: player.autoplay = true;

	$: player.src = $updateTrack;
	$: nowPlaying = nowPlaying;
	$: isWebkit = $iOS;
	// $: title = mixList[autoId].title;
	$: mixList = $list.mix;
	// $: list = $currentMix;
	let autoId = $key;

	$: time = player.currentTime;
	// $: currentTitle.set(title);
	$: duration = 1000;
	let remainingTime = 55;

	$: volume = 0.5;
	let volumeHover = false;

	$: isPlaying = false;
	let seeking = false;
	let once = false;
	let songBar;

	let menuShow = false;
	let showing;
	$: toggle = menuShow ? true : false;
	$: listShow = showing ? true : false;
	$: hasList = mixList.length > 1;

	// log any and all updates to the list for testing
	// $: console.log(mixList)

	const playing = () => player.play();
	const paused = () => player.pause();
	function pause() {
		paused();
	}
	function startPlay() {
		console.log(mixList);
		playing();
	}
	// $: console.log(volume)
	$: player.volume = volume;

	player.addEventListener("loadedmetadata", () => {
		isPlaying = true;
		startPlay();
	});

	player.addEventListener("timeupdate", async () => {
		time = player.currentTime;
		duration = player.duration;
		remainingTime = duration - time;
		$progress = isWebkit == true ? time * 2 : time;
		// This checks if the user is on an iOS device
		// due to the length of a song being doubled on iOS,
		// we have to cut the time in half. Doesn't effect other devices.
		if (isWebkit && remainingTime < duration / 2 && once == false) {
			once = true;
			getNext();
		}
	});

	player.addEventListener("pause", () => {
		isPlaying = false;
		pause();
	});

	player.addEventListener("play", () => {
		isPlaying = true;
		startPlay();
	});

	player.addEventListener("ended", () => {
		// console.log('ended')

		key.set(autoId);

		getNext();
	});

	player.addEventListener("seeked", () => {
		startPlay();
	});
	const getNext = async () => {
		if (autoId == mixList.length - 1) {
			list.getMore(
				autoId,
				$list.mix[autoId].itct,
				$list.mix[autoId].videoId,
				$list.mix[autoId].autoMixList,
				$list.continuation
			);
			// autoId++;
			key.set(autoId);

			once = false;

			return;
		} else {
			autoId++; // console.log(autoId)
			key.set(autoId);

			player.src = utils.getSrc(mixList[autoId].videoId).then((url) => url);

			// currentTitle.set(mixList[autoId].title);
			once = false;
		}
		once = false;
	};
	/* TODO: implement this eventually.
    format seconds to MM:SS for UI
    */
	function format(seconds) {
		if (isNaN(seconds)) return "...";

		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);
		if (seconds < 10) seconds = "0" + seconds;

		return `${minutes}:${seconds}`;
	}

	const progress = tweened(0, {
		duration: duration,
		easing: cubicOut,
	});
	function trackMouse(event) {
		if (seeking) seekAudio(event);
		// if (hovering) hover(event)
	}
	function seek(event, bounds) {
		let x = event.pageX - bounds.left;

		return Math.min(Math.max(x / bounds.width, 0), 1);
	}

	function seekAudio(event) {
		if (!songBar) return;

		player.currentTime =
			seek(event, songBar.getBoundingClientRect()) * duration;
		player.currentTime =
			isWebkit == true
				? (seek(event, songBar.getBoundingClientRect()) * duration) / 2
				: seek(event, songBar.getBoundingClientRect()) * duration;
	}

	let width;
</script>

<svelte:window
	bind:outerWidth={width}
	on:mouseup={() => (seeking = false)}
	on:mousemove={trackMouse} />

<Queue
	on:updated={(event) => {
		player.src = event.detail.src;
		autoId = event.detail.id;
		// console.log(autoId);
	}}
	on:hide={(event) => {
		showing = !event.detail.showing;
		// console.log(showing)
	}}
	bind:show={listShow}
	bind:mixList
	bind:autoId={$key} />

<div class="f-container">
	<div
		class="progress-bar"
		on:click={seekAudio}
		on:mousedown={() => (seeking = true)}>
		<progress bind:this={songBar} value={$progress} max={duration} />
	</div>
	<div class="player">
		<div class="player-left">
			<div
				on:click={() => {
					showing = !showing;
				}}
				class="listButton">
				<svelte:component this={Icon} name="radio" size="2em" />
			</div>
		</div>
		<div class="player-controls">
			<div class="buttons">
				<div
					class="player-btn"
					on:click={async () => {
						if (!autoId || autoId < 0) {
							console.log("cant do that!");
						} else {
							autoId--;
							key.set(autoId);
							await getSrc(mixList[autoId].videoId);
						}
					}}>
					<svelte:component this={Icon} name="skip-back" size="2em" />
				</div>
				<div
					class="player-btn player-title"
					on:click={() => {
						if (!isPlaying) {
							startPlay();
						} else {
							pause();
						}
					}}>
					{#if !isPlaying}
						<Icon name="play" size="2em" />
					{:else}
						<Icon name="pause" size="2em" />
					{/if}
				</div>
				<div
					class="player-btn"
					on:click={async () => {
						let gettingNext = false;
						if (!gettingNext) {
							if (autoId == mixList.length - 1) {
								gettingNext = true;
								await getNext();
								gettingNext = false;
							} else {
								gettingNext = true;
								autoId++;
								key.set(autoId);
								await getSrc(mixList[autoId].videoId);
								gettingNext = false;
							}
						}
					}}>
					<svelte:component this={Icon} name="skip-forward" size="2em" />
				</div>
			</div>
		</div>

		<div class="player-right">
			{#if width > 500}
				<div
					class="volume"
					use:clickOutside
					on:click_outside={() => {
						volumeHover = false;
					}}>
					<div
						class="volume-icon"
						on:click={() => {
							volumeHover = !volumeHover;
						}}>
						<svelte:component this={Icon} name="volume" size="2em" />
					</div>
					{#if volumeHover}
						<div class="volume-wrapper">
							<div class="volume-container">
								<div class="volume-slider">
									<input
										class="volume"
										type="range"
										bind:value={volume}
										min="0"
										max="1"
										step="0.1" />
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
			<div class="menu-container">
				<Dropdown type="player">
					<div slot="content">
						{#if hasList}
							<div
								class="dd-item"
								on:click={() => {
									scrollTo({
										behavior: "smooth",
										top: 0,
										left: 0,
									});

									goto(`/artist?id=${mixList[autoId].artistId}`, {
										replaceState: true,
									});
								}}>
								<Icon name="artist" size="2em" />
								<span class="dd-text">View Artist</span>
							</div>
						{/if}
					</div>
				</Dropdown>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.f-container {
		background-color: inherit;
	}
	.player {
		background-color: inherit;
	}
	.volume-wrapper {
		background: inherit;
		background: var(--dark-bottom);
		display: block;
		position: fixed;
		bottom: 8.9rem;
		transform: rotate(-90deg);
		padding: 0 0rem;
	}
	.volume-icon {
		cursor: pointer;
	}

	.menu-container {
		position: relative;

		@media (min-width: 37.1429rem) {
			right: 5%;
			/* bottom: 50%; */
			padding: 0;
			/* top: 50%; */
			/* overflow: hidden; */
			position: absolute;
		}
	}
	.player-right {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
	}
	.player-left {
		width: auto;
		display: flex;

		max-width: 100%;
	}
	.f-container {
		position: absolute;
		bottom: 0;
		width: 100%;
	}

	progress {
		display: block;
		width: 100%;
		height: 0.4315rem;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: transparent;
		background-color: #232530;
		z-index: 7;
		outline: none;
		border: none;
		border-color: transparent;
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
</style>
