<script>
	import keyboard from './js/keyboard.js'
	import { goto } from '$app/navigation'
	import Dropdown from './Dropdown.svelte'
	import { iOS } from './stores/stores.js'
	import { onMount } from 'svelte'
	import { tweened } from 'svelte/motion'
	import { getSrc } from '$lib/utils'
	import Playlist from './Playlist.svelte'
	import './../global/scss/components/_player.scss'
	import Icon from '$lib/Icon.svelte'
	import {
		playbackStatus,
		index,
		updateTrack,
		key,
		currentMix,
		currentTitle
	} from '$lib/stores/stores'
	import { cubicOut } from 'svelte/easing'
	import * as utils from '$lib/utils'
	import { clickOutside } from './js/clickOutside.js'

	export let title
	export let playerStatus = 'paused'
	export let nowPlaying

	const player = new Audio()
	$: player.autoplay = true

	$: player.src = $updateTrack
	$: playbackStatus.set({ playerStatus })
	$: nowPlaying = nowPlaying
	$: isWebkit = $iOS
	$: title = mixList[autoId].title

	$: mixList = $currentMix.list
	$: list = $currentMix
	$: autoId = $key

	$: time = player.currentTime
	$: currentTitle.set(title)
	$: duration = 1000
	let remainingTime = 55

	$: isPlaying = false
	let seeking = false
	let once = false
	let songBar

	let menuShow = false
	let showing = false
	$: toggle = menuShow ? true : false
	$: listShow = showing ? true : false
	$: hasList = mixList.length > 1

	// log any and all updates to the list for testing
	$: console.log(mixList)

	const playing = (e) => player.play()
	const paused = (e) => player.pause()
	function pause() {
		paused()
	}
	function startPlay() {
		playing()
	}

	player.addEventListener('loadedmetadata', () => {
		isPlaying = true
		startPlay()
	})

	player.addEventListener('timeupdate', async () => {
		time = player.currentTime
		duration = player.duration
		$progress = isWebkit == true ? time * 2 : time
		remainingTime = duration - time
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
		if (autoId == mixList.length - 1) {
			const data = await utils.getNext(
				autoId,

				mixList[autoId].itct,
				mixList[autoId].videoId,
				mixList[autoId].autoMixList,
				list.continuation
			)
			const res = await data

			mixList.pop()

			mixList = [
				...mixList,
				...data.results.map((d, i) => ({
					continuation: res.continuation,
					autoMixList: d.autoMixList,
					artistId: d.artistInfo.browseId,
					itct: d.itct,
					id: d.index,
					videoId: d.videoId,
					title: d.title,
					artist: d.artistInfo.artist,
					thumbnail: d.thumbnail,
					length: d.length
				}))
			]

			currentMix.set({
				videoId: `${mixList[autoId].videoId}`,
				playlistId: `${list.playlistId}`,
				continuation: res.continuation,
				list: mixList
			})

			autoId++
			player.src = await utils.getSrc(mixList[autoId].videoId)
			key.set(autoId)
			return mixList
		}
		autoId++

		// console.log(autoId)
		key.set(autoId)

		player.src = await utils.getSrc(mixList[autoId].videoId)

		currentTitle.set(mixList[autoId].title)
		once = false
	}
	/* TODO: implement this eventually.
    format seconds to MM:SS for UI
    */
	function format(seconds) {
		if (isNaN(seconds)) return '...'

		const minutes = Math.floor(seconds / 60)
		seconds = Math.floor(seconds % 60)
		if (seconds < 10) seconds = '0' + seconds

		return `${minutes}:${seconds}`
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

	let _key
	let keyCode

	function getKey(event) {
		_key = event.key
		keyCode = event.keyCode
		if (player.src !== undefined || player.src !== '') {
			switch (keyCode) {
				case 32:
					if (!isPlaying) {
						startPlay()
					} else {
						pause()
					}
					break
				case 39:
					player.currentTime += 5
					break
				case 37:
					player.currentTime -= 5
					break

				default:
					break
			}
		}
	}
</script>

<!-- on:keydown={(e) => getKey(e)} -->

<svelte:window on:mouseup={() => (seeking = false)} on:mousemove={trackMouse} />
<Playlist
	on:updated={(event) => {
		player.src = event.detail.src
		autoId = event.detail.id
		console.log(autoId)
	}}
	bind:show={listShow}
	bind:mixList
	bind:autoId />

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
					showing = !showing
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
						if (autoId < 0) {
							console.log('cant do that!')
						} else {
							autoId--
							key.set(autoId)
							await getSrc(mixList[autoId].videoId)
						}
					}}>
					<svelte:component this={Icon} name="skip-back" size="2em" />
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
					{#if !isPlaying}
						<Icon name="play" size="2em" />
					{:else}
						<Icon name="pause" size="2em" />
					{/if}
				</div>
				<div
					class="player-btn"
					on:click={async () => {
						if (autoId == mixList.length - 1) {
							await getNext()
						}
						autoId++
						key.set(autoId)
						await getSrc(mixList[autoId].videoId)
					}}>
					<svelte:component this={Icon} name="skip-forward" size="2em" />
				</div>
			</div>
		</div>

		<div>
			<div class="menu-container">
				<Dropdown type="player" bind:show={menuShow}>
					<div slot="content">
						{#if hasList}
							<div
								class="dd-item"
								on:click={() => {
									goto(`/artist?id=${mixList[autoId].artistId}`)
								}}>
								<Icon name="artist" size="1.5em" />
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
	.icon {
		align-self: baseline;
	}
	.hidden {
		display: none;
		transition: cubic-bezier(0.23, 1, 0.32, 1) all 0.2s;
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
