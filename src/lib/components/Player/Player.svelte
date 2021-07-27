<script>
	import { clickOutside } from '$lib/js/clickOutside'
	import { goto } from '$app/navigation'
	import Dropdown from '$components/Dropdown/Dropdown.svelte'
	import { iOS } from '$stores/stores'
	import { tweened } from 'svelte/motion'
	import { getSrc } from '$lib/utils'
	import Queue from './Queue.svelte'
	import '../../../global/scss/components/_player.scss'
	import Icon from '$components/Icon/Icon.svelte'
	import { updateTrack, key, currentTitle, playerLoading } from '$stores/stores'
	import { cubicOut } from 'svelte/easing'
	import list from '$lib/stores/list'
	import { tick } from 'svelte'
	export let curTheme
	const player: HTMLAudioElement = new Audio()
	player.autoplay = true
	// console.log($updateTrack)
	$: player.src = $updateTrack
	$: isWebkit = $iOS
	let title

	$: currentTitle.set(title)

	// $: list = $currentMix;
	$: autoId = $key
	$: console.log($key, autoId)
	$: time = player.currentTime
	$: duration = 1000
	let remainingTime = 55

	$: volume = 0.5
	let volumeHover
	$: hideEvent = false
	$: isPlaying = false
	let seeking = false
	let once = false
	let songBar

	let showing
	$: loading = $playerLoading
	$: listShow = showing ? true : false
	$: mixList = $list.mix

	$: isHidden = false
	let DropdownItems: Array<any>

	player.addEventListener('loadedmetadata', () => {
		title = $list.mix[0].title
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
			}
		]
	})
	const play = () => {
		let playTrack = player.play()
		if (playTrack !== undefined) {
			playTrack.then(() => metaDataHandler())
		} else {
			metaDataHandler()
		}
	}
	const pause = () => player.pause()
	// $: console.log(volume)
	$: player.volume = volume

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
		play()
	})

	player.addEventListener('ended', () => {
		// console.log('ended')

		key.set(autoId)

		getNext()
	})

	player.addEventListener('seeked', () => {
		play()
	})

	function metaDataHandler() {
		if ('mediaSession' in navigator && player.src !== undefined) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: $list.mix[autoId].title,
				artist: $list.mix[autoId].artistInfo.artist || null,
				album:
					$list.mix[autoId].album?.title ||
					$list.mix[autoId].album?.text ||
					undefined,

				artwork: [
					{
						src: $list.mix[autoId].thumbnails
							? $list.mix[autoId].thumbnails[0].url.replace(
									/=(w(\d+))-(h(\d+))/g,
									'=w128-h128'
							  )
							: $list.mix[autoId].thumbnail.replace(
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
			navigator.mediaSession.setActionHandler('previoustrack', prevBtn)
			navigator.mediaSession.setActionHandler('nexttrack', nextBtn)
		}
	}
	$: console.log($list.mix)

	const getNext = async () => {
		if (autoId == $list.mix.length - 1) {
			await tick()
			// autoId++
			list.getMore(
				autoId,
				$list.mix[autoId]?.itct,
				$list.mix[autoId]?.videoId,
				$list.mix[autoId]?.autoMixList,
				$list.continuation
			)
			// autoId++;
			key.set(autoId)

			once = false

			return
		} else {
			autoId++
			key.set(autoId)
			const src = await getSrc(mixList[autoId].videoId)
			src.error ? ErrorNext() : setNext()
			await tick()

			console.log('got here')
			currentTitle.set($list.mix[autoId].title)
			once = false
		}
		once = false
	}
	async function ErrorNext() {
		await tick()
		getNext()
		// autoId--
		// key.set(autoId)
		// const src = await getSrc(mixList[autoId].videoId)

		// console.log('got here ErrorNext')
		// currentTitle.set($list.mix[autoId].title)
		// once = false
	}
	async function setNext() {
		await getSrc(mixList[autoId].videoId)
		currentTitle.set($list.mix[autoId].title)
		key.set(autoId)
	}
	async function prevBtn() {
		if (!autoId || autoId < 0) {
			console.log('cant do that!')
		} else {
			autoId--
			key.set(autoId)
			await getSrc($list.mix[autoId].videoId)
		}
	}
	async function nextBtn() {
		let gettingNext = false
		if (!gettingNext) {
			if (autoId == $list.mix.length - 1) {
				gettingNext = true
				await getNext()
				gettingNext = false
			} else {
				gettingNext = true
				autoId++
				console.log(mixList[autoId].videoId, $list.mix, $list.mix[autoId])
				key.set(autoId)
				const src = await getSrc(mixList[autoId]?.videoId)
				src.error
					? getNext()
					: () => {
							gettingNext = false
							setNext()
					  }
			}
		}
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
		if (!songBar && !isPlaying) return

		player.currentTime = seek(event, songBar.getBoundingClientRect()) * duration
		player.currentTime =
			isWebkit == true
				? (seek(event, songBar.getBoundingClientRect()) * duration) / 2
				: seek(event, songBar.getBoundingClientRect()) * duration
	}

	let width

	// $: console.log($list.mix)
</script>

<svelte:window
	bind:outerWidth={width}
	on:mouseup={() => (seeking = false)}
	on:mousemove={trackMouse} />

<Queue
	on:updated={async (event) => {
		key.set(event.detail.id)
		await tick()
		getNext()
		// console.log(autoId);
	}}
	on:hide={(event) => {
		hideEvent = true
		showing = !event.detail.showing
		hideEvent = false
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
					if (!hideEvent) showing = !showing
				}}
				class="listButton player-btn">
				<svelte:component this={Icon} color="white" name="radio" size="2em" />
			</div>
		</div>
		<div class="player-controls">
			<div class="buttons">
				<div class="player-btn" on:click={prevBtn}>
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
							play()
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
				<div class="player-btn" on:click={nextBtn}>
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
										step="any" />
								</div>
							</div>
						</div>
					{/if}
				</div>
				<div class="menu-container">
					<Dropdown
						bind:isHidden
						on:click_outside={() => {
							isHidden = !isHidden
						}}
						type="player"
						items={DropdownItems} />
				</div>
			{/if}
			<div class:hidden={width > 500} class="menu-container">
				<Dropdown bind:isHidden type="player" items={DropdownItems} />
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.hidden {
		display: none !important;
		visibility: hidden !important;
	}
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
		background: var(--dark-bottom);
		display: block;
		position: absolute;
		bottom: 7.9rem;
		transform: rotate(-90deg);
		padding: 0;
	}
	.volume-icon {
		cursor: pointer;
	}

	.menu-container {
		right: 5%;
		/* bottom: 50%; */
		padding: 0;
		/* top: 50%; */
		/* overflow: hidden; */
		position: absolute;
		@media (max-width: 512px) {
			position: relative !important;
		}
	}

	.player-left,
	.player-right {
		-webkit-text-size-adjust: 100%;
		align-self: center;
		cursor: pointer;
		height: auto;
		max-height: 44pt;
		max-width: 44pt;
		margin: 10pt;
		padding: 10pt;
		width: auto;
		width: 100%;
		width: 100%;
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
		height: 0.5315rem;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background: transparent;
		background-color: #232530;
		/* z-index: 7; */
		outline: none;
		border: transparent;
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
