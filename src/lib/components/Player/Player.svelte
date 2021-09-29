<script lang="ts">
	import { browser } from '$app/env'

	import { goto } from '$app/navigation'
	import Dropdown from '$components/Dropdown/Dropdown.svelte'
	import Icon from '$components/Icon/Icon.svelte'
	import db from '$lib/db'
	import { clickOutside } from '$lib/js/clickOutside'
	import list from '$lib/stores/list'
	import { getSrc } from '$lib/utils'
	import {
		currentTitle,
		iOS,
		key,
		playerLoading,
		theme,
		updateTrack
	} from '$stores/stores'
	import { tick } from 'svelte'
	import { cubicOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'
	import { fade } from 'svelte/transition'
	import Controls from './Controls.svelte'
	import Queue from './Queue.svelte'
	import QueueListItem from './QueueListItem.svelte'

	const player: HTMLAudioElement = new Audio()
	$: player.autoplay = $updateTrack !== undefined ? true : false
	$: player.src = $updateTrack
	$: isWebkit = $iOS
	let title

	$: autoId = $key

	$: time = player.currentTime
	$: duration = 1000
	$: remainingTime = 55

	$: volume = 0.5
	$: player.volume = volume
	let volumeHover
	let isPlaying = false
	let seeking = false
	let songBar
	let seekBar
	let hoverWidth

	let showing
	let hide
	let hovering
	$: loading = $playerLoading
	$: mixList = $list.mix

	$: isHidden = false
	let DropdownItems: Array<any>
	let once = false
	$: console.log($list.mix)
	player.addEventListener('loadedmetadata', () => {
		isPlaying = true
		play()
		DropdownItems = [
			{
				text: 'View Artist',
				icon: 'artist',
				action: () => {
					window.scrollTo({
						behavior: 'smooth',
						top: 0,
						left: 0
					})
					goto(`/artist/${mixList[autoId].artistInfo.browseId}`)
				}
			},
			{
				text: 'Add to Favorites',
				icon: 'heart',
				action: async () => {
					// console.log(data)
					if (!browser) return
					await db.setNewFavorite($list.mix[autoId])
				}
			}
		]
	})
	const play = () => {
		isPlaying = true
		key.set(autoId)
		let playTrack = player.play()
		if (playTrack !== undefined) {
			playTrack.then(() => metaDataHandler())
		} else {
			metaDataHandler()
		}
	}
	const pause = () => player.pause()
	const setPosition = () => {
		navigator.mediaSession.setPositionState({
			duration: isWebkit ? duration / 2 : duration,
			position: player.currentTime
		})
	}
	player.addEventListener('timeupdate', () => {
		time = player.currentTime
		duration = player.duration
		remainingTime = duration - time
		$progress = isWebkit == true ? time * 2 : time

		/* This checks if the user is on an iOS device
		 	 due to the length of a song being doubled on iOS,
			 we have to cut the time in half. Doesn't effect other devices.
		*/
		if (isWebkit && remainingTime < duration / 2 && once == false) {
			// player.currentTime = 0
			// getNext();
			player.currentTime = player.currentTime * 2
		}
	})

	player.addEventListener('pause', () => {
		isPlaying = false
		pause()
	})

	player.addEventListener('play', () => play())

	player.addEventListener('ended', () => getNext())

	player.addEventListener('seeked', () => {
		if (!isPlaying) return
		play()
	})

	function metaDataHandler() {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: $list.mix[autoId || 0].title,
				artist: $list.mix[autoId || 0].artistInfo.artist || null,
				album:
					$list.mix[autoId || 0].album?.title ||
					$list.mix[autoId || 0].album?.text ||
					undefined,
				artwork: [
					{
						src: $list.mix[autoId || 0].thumbnails
							? $list.mix[autoId || 0].thumbnails[0].url.replace(
									/=(w(\d+))-(h(\d+))/g,
									'=w128-h128'
							  )
							: $list.mix[autoId || 0].thumbnail.replace(
									/=(w(\d+))-(h(\d+))/g,
									'=w128-h128'
							  ),
						sizes: '128x128',
						type: 'image/jpeg'
					}
				]
			})
			navigator.mediaSession.setActionHandler('play', play)
			navigator.mediaSession.setActionHandler('pause', pause)
			navigator.mediaSession.setActionHandler('seekto', (session) => {
				if (session.fastSeek && 'fastSeek' in player) {
					player.fastSeek(session.seekTime)
					setPosition()
					return
				}
				player.currentTime = session.seekTime
				setPosition()
			})
			navigator.mediaSession.setActionHandler('previoustrack', prevBtn)
			navigator.mediaSession.setActionHandler('nexttrack', nextBtn)
		}
	}

	async function getNext() {
		once = true
		if (autoId == $list.mix.length - 1) {
			list
				.getMore(
					$list.mix[autoId]?.itct,
					$list.mix[autoId]?.videoId,
					$list.currentMixId,
					$list.continuation,
					$list.clickTrackingParams
				)
				.then(({ body }) => {
					player.src = body
				})

			once = false

			return
		} else {
			autoId++
			key.set(autoId)

			const src = await getTrackURL()
			player.src = src
			currentTitle.set($list.mix[autoId].title)
			once = false
		}
	}

	async function getTrackURL() {
		return await getSrc(mixList[autoId].videoId).then(({ body, error }) => {
			if (error === true) {
				getNext()
			}
			currentTitle.set($list.mix[autoId].title)
			return body
		})
	}

	function setNext() {
		getTrackURL()
		currentTitle.set($list.mix[autoId].title)
	}
	function prevBtn() {
		if (!autoId || autoId < 0) {
			console.log('cant do that!')
		} else {
			autoId--
			key.set(autoId)
			getTrackURL()
		}
	}
	async function nextBtn() {
		let gettingNext = false
		if (!gettingNext) {
			if (autoId == $list.mix.length - 1) {
				gettingNext = true
				key.set(autoId)
				await getNext()
				autoId++
				key.set(autoId)

				gettingNext = false
				return
			} else {
				gettingNext = true
				autoId++

				key.set(autoId)
				getTrackURL()
				gettingNext = false
			}
		}
	}
	const progress = tweened(0, {
		duration: duration,
		easing: cubicOut
	})
	function trackMouse(event) {
		if (seeking) seekAudio(event)
		if (hovering) hoverEvent(event)
	}
	function seek(event, bounds) {
		let x = event.pageX - bounds.left

		return Math.min(Math.max(x / bounds.width, 0), 1)
	}
	function hoverEvent(event) {
		if (!songBar) return
		hoverWidth = hover(event, songBar.getBoundingClientRect())
	}
	function hover(event, bounds) {
		let x = event.clientX + bounds.left
		return Math.min(Math.max(x / bounds.width, 0), 1)
	}

	function seekAudio(event) {
		if (!songBar && isPlaying === false) return

		player.currentTime = seek(event, songBar.getBoundingClientRect()) * duration
		player.currentTime =
			isWebkit == true
				? (seek(event, songBar.getBoundingClientRect()) * duration) / 2
				: seek(event, songBar.getBoundingClientRect()) * duration
	}
</script>

<svelte:window on:mouseup={() => (seeking = false)} on:mousemove={trackMouse} />

<div class="f-container" transition:fade>
	<div
		class="progress-bar"
		transition:fade
		on:click={seekAudio}
		on:mousedown={() => (seeking = true)}
		on:mouseleave={() => (hovering = false)}
		on:mouseenter={() => (hovering = true)}
	>
		{#if hovering}
			<div
				class="hover"
				transition:fade={{ duration: 150 }}
				bind:this={seekBar}
				style="transform:scaleX({hoverWidth})"
			/>
		{/if}
		<progress bind:this={songBar} value={$progress} max={duration} />
	</div>
	<div class="player" class:light={$theme == 'light'}>
		<div
			style="background:inherit;"
			on:click_outside={() => {
				showing = false
			}}
			use:clickOutside
			class="player-left"
		>
			{#if showing}
				<Queue bind:autoId={$key} let:ctxKey bind:showing let:item let:index>
					<row id={index}>
						<QueueListItem
							{ctxKey}
							on:removeItem={async () => {
								showing = true
								if (index == $key) {
									key.set(index - 1)
									await tick()
									getNext()
								}
							}}
							on:updated={async (event) => {
								key.set(index - 1)
								await tick()
								getNext()
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
						showing = false
					} else {
						showing = true
					}
					showing = showing ? true : false
				}}
				class="listButton player-btn"
			>
				<Icon color="white" name="radio" size="2em" />
			</div>
		</div>
		<Controls bind:isPlaying bind:loading {play} {pause} {nextBtn} {prevBtn} />
		<div class="player-right">
			<div
				class="volume player-btn"
				use:clickOutside
				on:click_outside={() => (volumeHover = false)}
			>
				<div
					color="white"
					class="volume-icon"
					on:click={() => (volumeHover = !volumeHover)}
				>
					<Icon color="white" name="volume" size="2em" />
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
			<div class="menu-container">
				<Dropdown
					bind:isHidden
					on:click_outside={() => (isHidden = !isHidden)}
					type="player"
					items={DropdownItems}
				/>
			</div>
			<!-- <div class="menu-container__desktop">
				<Dropdown bind:isHidden type="player" items={DropdownItems} />
			</div> -->
		</div>
	</div>
</div>

<style lang="scss">
	@import '../../../global/stylesheet/components/_player.scss';
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
	.f-container {
		background-color: inherit;
		position: absolute;
		grid-area: f/f/f/f;
		box-shadow: 0 0rem 1rem 0rem #00000070;
		height: 100%;
	}
	.light * {
		color: white !important;
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
		padding: 0;
		height: 1.3rem;
		align-items: center;
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
		right: 5%;

		padding: 0;

		position: absolute;
		will-change: position;
		@media screen and (max-width: 500px) {
			position: relative !important;
		}
	}
	.progress-bar {
		position: relative;
		height: 0.5rem;
		width: 100%;
		will-change: visibility;
	}
	.player-left,
	.player-right {
		align-self: center;
		height: auto;
		max-height: 44pt;
		max-width: 44pt;
		place-self: center;

		// padding: 10pt;
		width: auto;
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.f-container {
		position: absolute;
		bottom: 0;
		width: 100%;
	}

	progress {
		display: block;
		width: 100%;
		height: 0.5rem;
		position: absolute;
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
		&::before {
			background-color: #232530;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			content: '';
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
