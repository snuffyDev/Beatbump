<script>
	import { clickOutside } from '$lib/js/clickOutside'
	import { goto } from '$app/navigation'
	import Dropdown from '$components/Dropdown/Dropdown.svelte'
	import { iOS } from '$stores/stores'
	import { fade } from 'svelte/transition'
	import { tweened } from 'svelte/motion'
	import { getSrc } from '$lib/utils'
	import Queue from './Queue.svelte'
	import '../../../global/scss/components/_player.scss'
	import Icon from '$components/Icon/Icon.svelte'
	import {
		updateTrack,
		key,
		currentMix,
		currentTitle,
		playerLoading
	} from '$stores/stores'
	import { cubicOut } from 'svelte/easing'
	import * as utils from '$lib/utils'
	import list from '$lib/stores/list'
	export let curTheme
	const player: HTMLAudioElement = new Audio()
	player.autoplay = true

	$: player.src = $updateTrack
	$: isWebkit = $iOS
	let title

	$: currentTitle.set(title)

	// $: list = $currentMix;
	$: autoId = $key

	$: time = player.currentTime
	$: duration = 1000
	let remainingTime = 55

	$: volume = 0.5
	let volumeHover = false

	$: isPlaying = false
	let seeking = false
	let once = false
	let songBar

	let menuShow = false
	let showing
	$: loading = $playerLoading
	$: toggle = menuShow ? true : false
	$: listShow = showing ? true : false
	$: hasList = $list.mix.length > 1
	$: mixList = $list.mix
	// log any and all updates to the list for testing
	// $: console.log($list.mix)
	// $: console.log(mixList, $list.mix[autoId]?.videoId);
	let DropdownItems = [
		{
			text: 'View Artist',
			icon: 'artist',
			action: () => {
				window.scrollTo({
					behavior: 'smooth',
					top: 0,
					left: 0
				})
				goto(`/artist/${mixList[0].artistInfo.browseId}`)
			}
		}
	]

	const playing = () => player.play()
	const paused = () => player.pause()
	function pause() {
		paused()
	}
	function startPlay() {
		playing()
	}
	// $: console.log(volume)
	$: player.volume = volume

	player.addEventListener('loadedmetadata', () => {
		isPlaying = true

		startPlay()
	})

	player.addEventListener('timeupdate', async () => {
		time = player.currentTime
		duration = player.duration
		remainingTime = duration - time
		$progress = isWebkit == true ? time * 2 : time
		// This checks if the user is on an iOS device
		// due to the length of a song being doubled on iOS,
		// we have to cut the time in half. Doesn't effect other devices.
		if (isWebkit && remainingTime < duration / 2 && once == false) {
			once = true
			getNext()
		}
	})

	player.addEventListener('pause', () => {
		isPlaying = false
		pause()
	})

	player.addEventListener('play', () => {
		isPlaying = true
		startPlay()
	})

	player.addEventListener('ended', () => {
		// console.log('ended')

		key.set(autoId)

		getNext()
	})

	player.addEventListener('seeked', () => {
		startPlay()
	})
	const getNext = async () => {
		if (autoId == $list.mix.length - 1) {
			list.getMore(
				autoId,
				$list.mix[autoId].itct,
				$list.mix[autoId].videoId,
				$list.mix[autoId].autoMixList,
				$list.continuation
			)
			// autoId++;
			key.set(autoId)

			once = false

			return
		} else {
			autoId++ // console.log(autoId)
			key.set(autoId)

			player.src = utils.getSrc(mixList[autoId].videoId).then((url) => url)

			// currentTitle.set($list.mix[autoId].title);
			once = false
		}
		once = false
	}

	const progress = tweened(0, {
		duration: duration,
		easing: cubicOut
	})
	function trackMouse(event) {
		if (seeking) seekAudio(event)
		// if (hovering) hover(event)
	}
	function seek(event, bounds) {
		let x = event.pageX - bounds.left

		return Math.min(Math.max(x / bounds.width, 0), 1)
	}

	function seekAudio(event) {
		if (!songBar) return

		player.currentTime = seek(event, songBar.getBoundingClientRect()) * duration
		player.currentTime =
			isWebkit == true
				? (seek(event, songBar.getBoundingClientRect()) * duration) / 2
				: seek(event, songBar.getBoundingClientRect()) * duration
	}

	let width
</script>

<svelte:window
	bind:outerWidth={width}
	on:mouseup={() => (seeking = false)}
	on:mousemove={trackMouse} />

<Queue
	on:updated={(event) => {
		player.src = event.detail.src
		autoId = event.detail.id
		// console.log(autoId);
	}}
	on:hide={(event) => {
		showing = !event.detail.showing
		// console.log(showing)
	}}
	bind:show={listShow}
	bind:autoId={$key} />

<div class="f-container">
	<div
		class="progress-bar"
		on:click={seekAudio}
		on:mousedown={() => (seeking = true)}>
		<progress bind:this={songBar} value={$progress} max={duration} />
	</div>
	<div class="player" class:light={curTheme == 'light'}>
		<div class="player-left">
			<div
				on:click={() => {
					showing = !showing
				}}
				class="listButton">
				<svelte:component this={Icon} color="white" name="radio" size="2em" />
			</div>
		</div>
		<div class="player-controls">
			<div class="buttons">
				<div
					class="player-btn"
					on:click={async () => {
						if (!autoId || autoId < 0) {
							console.log('cant do that!')
						} else {
							autoId--
							key.set(autoId)
							await getSrc($list.mix[autoId].videoId)
						}
					}}>
					<svelte:component
						this={Icon}
						color="white"
						name="skip-back"
						size="2em" />
				</div>
				<div
					class="player-btn player-title"
					on:click={() => {
						if (!isPlaying) {
							startPlay()
						} else {
							pause()
						}
					}}>
					{#if loading}
						<div
							class="player-spinner"
							class:fade-out={loading ? true : false} />
					{:else if !isPlaying}
						<Icon color="white" name="play" size="2em" />
					{:else if !loading && isPlaying}
						<Icon color="white" name="pause" size="2em" />
					{/if}
				</div>
				<div
					class="player-btn"
					on:click={async () => {
						let gettingNext = false
						if (!gettingNext) {
							if (autoId == $list.mix.length - 1) {
								gettingNext = true
								await getNext()
								gettingNext = false
							} else {
								gettingNext = true
								autoId++
								console.log(
									mixList[autoId].videoId,
									$list.mix,
									$list.mix[autoId]
								)
								await getSrc(mixList[autoId]?.videoId)
								key.set(autoId)
								gettingNext = false
							}
						}
					}}>
					<svelte:component
						this={Icon}
						color="white"
						name="skip-forward"
						size="2em" />
				</div>
			</div>
		</div>

		<div class="player-right">
			{#if width > 500}
				<div
					class="volume"
					use:clickOutside
					on:click_outside={() => {
						volumeHover = false
					}}>
					<div
						color="white"
						class="volume-icon"
						on:click={() => {
							volumeHover = !volumeHover
						}}>
						<svelte:component
							this={Icon}
							color="white"
							name="volume"
							size="2em" />
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
										behavior: 'smooth',
										top: 0,
										left: 0
									})

									goto(`/artist/${$list.mix[autoId].artistId}`, {
										replaceState: true
									})
								}}>
								<Icon color="white" name="artist" size="2em" />
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
	.player-spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		justify-self: center;
		width: 2em;
		// background: white;
		height: 2em;
		border: rgba(255, 255, 255, 0.26) solid 0.25em;
		border-radius: 50%;
		border-top-color: rgba(255, 255, 255, 0.904);
		animation: loading 1s infinite cubic-bezier(0.785, 0.135, 0.15, 0.86);
		width: 2em;
		opacity: 0;
		// background: white;
		transition: all ease-in-out 1s;
		&.fade-out {
			opacity: 1;
			transition: all ease-in-out 1s;
		}
		height: 2em;
	}
	@keyframes loading {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes loaddone {
		to {
		}
	}
	.f-container {
		background-color: inherit;
	}
	.light * {
		color: white !important;
	}

	.player {
		background-color: inherit;
	}
	.volume-wrapper {
		background: inherit;
		background: var(--dark-bottom);
		display: block;
		position: absolute;
		bottom: 7.9rem;
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
