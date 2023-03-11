<script
	context="module"
	lang="ts"
>
</script>

<script lang="ts">
	import { navigating } from "$app/stores";
	import { AudioPlayer } from "$lib/player";
	import { filterAutoPlay, immersiveQueue, isMobileMQ, isPagePlaying, playerLoading, theme } from "$lib/stores";
	import { queue, currentTrack, queuePosition } from "$lib/stores/list";
	import ListItem from "../ListItem/ListItem.svelte";
	import Loading from "../Loading/Loading.svelte";
	import Tabs from "../Tabs";
	import TrackList from "../TrackList";
	import { fullscreenStore } from "./channel";
	import Controls from "./Controls.svelte";
	import { pan } from "$lib/actions/gestures/handlers";
	import { tweened } from "svelte/motion";
	import { cubicOut, quartIn, quartOut } from "svelte/easing";
	import { draggable } from "$lib/actions/draggable";
	import { groupSession } from "$lib/stores/sessions";
	import ProgressBar from "./ProgressBar";
	import { CTX_ListItem } from "$lib/contexts";
	import { requestFrameSingle } from "$lib/utils";
	import type { Thumbnail } from "$lib/types";
	import { windowWidth } from "$stores/window";
	import type { EasingFunction, TransitionConfig } from "svelte/transition";
	import PopperButton from "$components/Popper/PopperButton.svelte";
	import { createPlayerPopperMenu } from "./Player.svelte";
	import { SITE_ORIGIN_URL } from "$stores/url";
	import type { Dropdown } from "$lib/configs/dropdowns.config";
	import SessionListService from "$stores/list/sessionList";
	import { related } from "$stores/list/derived";
	import Carousel from "$components/Carousel/Carousel.svelte";
	import Description from "$components/ArtistPageHeader/Description/Description.svelte";

	export let state: "open" | "closed";

	const { paused } = AudioPlayer;

	let windowHeight = 0,
		queueHeight = 0,
		sliding = false;
	let titleWidth = 320;
	let active = "UpNext";
	let thumbnail: Thumbnail;
	let tracklist: HTMLDivElement;

	$: loading = $playerLoading;
	$: data = $currentTrack;
	$: heightCalc = -windowHeight + 140;
	$: queueOpen = true;

	const tabs = [
		{
			id: "UpNext",
			text: "Up Next",
			action: () => {
				active = tabs[0].id;
			},
		},
		{
			id: "Related",
			text: "Related",
			action: async () => {
				if (!$SessionListService.related) return;
				active = tabs[1].id;
			},
		},
	];

	const motion = tweened(0, {
		duration: 180,
		easing: cubicOut,
	});

	const queueTween = tweened(0, {
		duration: 180,
		easing: cubicOut,
	});

	CTX_ListItem.set({ page: "queue" });

	function onDragStart(kind, { detail }) {
		sliding = true;
	}

	function release(kind: number, detail) {
		if (sliding) {
			if (Math.sign(detail.deltaY) < 0) {
				open(kind, detail);
			} else {
				close(kind, detail);
			}
			sliding = false;
		}
	}

	function trackMovement(kind: number, detail) {
		if (kind === 1) {
			motion.set(Math.min(48, Math.max(heightCalc, detail.clientY - 8)), { duration: 180 });
		} else {
			queueTween.set(0 - (detail.clientY * 0.7 + detail.clientY * 0.3) / windowHeight, { duration: 180 });
		}
	}

	function open(kind: number, detail) {
		const step = detail.deltaY / queueHeight;
		const miss = detail.velocityY >= 0 && detail.velocityY > 0.2 ? 1 - step : 1 - step;
		const distance = miss * windowHeight;
		if (kind === 1) {
			motion.update(
				() => {
					return heightCalc;
				},
				{
					duration: Math.min(distance / Math.abs(detail.velocityY), 640),
				},
			);
		} else {
			queueTween.update(
				(_) => {
					return 0;
				},
				{ duration: Math.min(distance / Math.abs(detail.velocityY), 640) },
			);
		}
	}

	function close(kind: number, detail) {
		const step = detail.deltaY / queueHeight;
		const miss = detail.velocityY >= 0 && detail.velocityY > 0.2 ? 1 - step : step;
		const distance = miss * windowHeight;
		if (kind === 1) {
			motion.set(0, {
				duration: Math.min(distance / Math.abs(detail.velocityY), 640),
			});
		} else {
			queueTween.update(
				(_) => {
					return windowHeight;
				},
				{ duration: Math.min(distance / Math.abs(detail.velocityY), 640) },
			);
		}
		sliding = false;
	}

	$: {
		thumbnail = Array.isArray(data?.thumbnails)
			? data?.thumbnails.at(-1)
			: {
					width: 0,
					height: 0,
					url: "",
					placeholder: "",
			  };
	}

	$: if ($navigating !== null) {
		(() => {
			fullscreenStore.set("closed");
			$motion = 0;
			$queueTween = 0;
		})();
	}

	$: console.log($immersiveQueue, $filterAutoPlay, $theme);

	function slideInOut(
		node: HTMLElement,
		{ duration = 400, delay = 400, easing = quartOut }: { duration?: number; easing?: EasingFunction; delay?: number },
	): TransitionConfig {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === "none" ? "" : style.transform;
		const od = target_opacity * (1 - 0);

		return {
			easing,
			duration,
			delay,
			css(t, u) {
				return `
				will-change: transform, opacity;
					transform: ${transform} translate3d(0vh, ${(1 - t) * 100}vh, 0vh);
					opacity: ${target_opacity - od * u};
				`;
			},
		};
	}
	let DropdownItems: Dropdown;

	$: {
		if ($isMobileMQ) {
			DropdownItems = createPlayerPopperMenu(
				$currentTrack,
				$queuePosition,
				groupSession.hasActiveSession,
				$SITE_ORIGIN_URL,
			);
		} else {
			DropdownItems = undefined;
		}
	}
	$: console.log($related);
</script>

{#if $queue.length && state === "open"}
	<div
		class="backdrop"
		class:mobile={$isMobileMQ}
		bind:clientHeight={windowHeight}
		style:pointer-events={state === "open" ? "all" : "none"}
	>
		<div
			class="fullscreen-player-popup"
			in:slideInOut|local={{ delay: 400, duration: 400 }}
			out:slideInOut|local={{ delay: 200, duration: 400, easing: quartIn }}
		>
			<div
				class="column container"
				use:pan
				on:pan={(event) => {
					if (!$isMobileMQ) return;
					const { detail } = event;
					if (Math.abs(detail.deltaY) < 105) return;
					trackMovement(0, detail);
				}}
				on:panend={(event) => {
					if (!$isMobileMQ) return;
					const { detail } = event;
					const direction = Math.sign(detail.deltaY) === -1 ? "up" : "down";
					// notify(`${detail.deltaY} : ${detail.velocityY}`, "success");
					if (Math.abs(detail.deltaY) < 105) return;
					if (direction === "down") {
						close(0, detail);
						fullscreenStore.set("closed");
					} else {
						open(0, detail);
					}
				}}
			>
				{#if $immersiveQueue}
					<div class="immersive">
						<img
							id="img"
							loading="eager"
							decoding="sync"
							style="aspect-ratio: {thumbnail?.width} / {thumbnail?.height};"
							width={thumbnail?.width}
							height={thumbnail?.height}
							src={thumbnail ? thumbnail?.url : ""}
							alt="thumbnail"
						/>
					</div>
				{/if}
				{#if $isMobileMQ}
					<div class="menu-mobile">
						<PopperButton
							items={DropdownItems}
							tabindex={-1}
							size="2em"
						/>
					</div>
				{/if}
				<div
					class="album-art"
					style="width: {!$isMobileMQ ? (queueOpen ? 55 : 95) : '100'}vw;"
				>
					<div class="img-container">
						{#if loading}
							<Loading size="3em" />
						{/if}
						<div class="thumbnail">
							<img
								id="img"
								loading="lazy"
								style="aspect-ratio: {thumbnail?.width} / {thumbnail?.height};"
								width={thumbnail?.width}
								height={thumbnail?.height}
								src={thumbnail ? thumbnail?.url : data?.thumbnail}
								alt="thumbnail"
							/>
						</div>
					</div>
				</div>
				{#if $isMobileMQ}
					<div class="container controls">
						<div
							class="container text-shadow"
							style="overflow:hidden;"
						>
							<div class="marquee">
								<span
									class="marquee-wrapper"
									style="animation-play-state: {state === 'open' && titleWidth > $windowWidth
										? 'running'
										: 'paused'}; {titleWidth < $windowWidth ? 'animation: none; transform: unset;' : ''}"
									><span
										bind:clientWidth={titleWidth}
										class="h5 marquee-text">{data?.title}</span
									></span
								>
							</div>
							<span
								class="h6"
								style="text-align:center; "
								>{data?.artistInfo && data?.artistInfo.artist.at(0) ? data?.artistInfo.artist.at(0).text : ""}</span
							>
						</div>
						<div
							class="container"
							style="margin-bottom: 1em; max-width: 75vw; margin-inline: auto;"
						>
							<ProgressBar />
						</div>
						<Controls
							sizes={{ main: "2.75em", skip: "1.75em" }}
							bind:isPaused={$paused}
							bind:loading={$playerLoading}
							on:play={() => AudioPlayer.play()}
							isQueue={true}
							pause={() => AudioPlayer.pause()}
							nextBtn={() => {
								if ($queue.length === 0) return;
								SessionListService.next(true, groupSession.hasActiveSession ? true : false);
								// AudioPlayer.updateTime($durationStore);
							}}
							prevBtn={() => AudioPlayer.previous(true)}
						/>
					</div>
				{/if}
			</div>

			<div
				class="handle vertical"
				style="transform: translate3d({queueOpen ? 53.5 : 91.5}vw, 0px, 0) !important;"
				on:pointerover={() => {
					tracklist.style.willChange = "transform";
				}}
				on:click={() => {
					requestFrameSingle(() => {
						queueOpen = !queueOpen;
						tracklist.style.willChange = "unset";
					});
				}}
			>
				<hr class="vertical" />
			</div>
			<div
				class="column container tracklist"
				bind:clientHeight={queueHeight}
				bind:this={tracklist}
				style={$isMobileMQ
					? `transform: translate3d(0, ${$motion}px, 0); top: ${
							windowHeight - 65
					  }px; bottom:0; padding-bottom: calc(6.5em);`
					: `transform: translate3d(${queueOpen ? 55 : 93}vw, 0px, 0) !important;`}
			>
				<div
					use:draggable
					on:dragstart|capture|stopPropagation={(e) => onDragStart(1, e)}
					on:dragmove|capture|stopPropagation={(e) => trackMovement(1, e.detail)}
					on:dragend|capture|stopPropagation={(e) => release(1, e.detail)}
					on:pointerdown={() => {
						tracklist.style.willChange = "scroll-position, transform";
					}}
					on:pointerup={() => {
						requestFrameSingle(() => {
							tracklist.style.willChange = "unset";
						});
					}}
					class="handle horz"
				>
					<hr class="horz" />
					<span />
				</div>
				<Tabs
					{tabs}
					{active}
				>
					<svelte:fragment
						let:isActive
						let:tab
						slot="tab"
					>
						{#if tab.id === "UpNext"}
							{#if isActive}
								<div class="scroller">
									<TrackList
										items={$queue}
										hasData={true}
										let:index
										let:item
									>
										<ListItem
											{item}
											idx={index}
											on:setPageIsPlaying={() => {
												if (isPagePlaying.has("player-queue")) return;
												isPagePlaying.add("player-queue");
											}}
										/>
									</TrackList>
								</div>
							{/if}
						{:else if isActive}
							<div class="scroller">
								<div class="pad">
									{#if $related.description.description}
										<div class="mb-2">
											<span class="h2">{$related?.description?.header}</span>
											<Description description={$related.description.description} />
										</div>
									{/if}
									{#if Array.isArray($related.carousels)}
										{#key $related.carousels}
											{#each $related.carousels as carousel, idx}
												<Carousel
													header={carousel.header}
													items={carousel.items}
													type="home"
													kind={carousel.header?.type}
													isBrowseEndpoint={false}
												/>
											{/each}
										{/key}
									{/if}
								</div>
							</div>
						{/if}
					</svelte:fragment>
				</Tabs>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.pad {
		padding: 2vh 1em 1.5em 1em;
		// height: 100%;

		overflow-y: auto;
		contain: style paint size layout;
		width: 100%;
	}
	.marquee {
		position: relative;
		overflow: hidden;
		max-width: calc(100% - 4em);
		margin: 0 auto;
		--max-width: calc(100% - 4em);
		--offset: 10vw;
		--move-initial: calc(-10vw + var(--offset));
		--move-final: calc(calc(-100% + 80vw) + var(--offset));

		--text-initial: calc(10vw);
		--text-final: calc(var(--text-initial) * 100vw);
	}
	.marquee-wrapper {
		width: fit-content;
		display: flex;
		position: relative;
		transform: translate3d(var(--move-initial), 0, 0);
		animation: marquee linear infinite forwards;
		animation-delay: 2s;
		animation-duration: 9s;
		// animation-play-state: running;
		// box-shadow:  inset (-40px) 0 40px (-16px) transparent;
	}
	.marquee-text {
		padding: 0 1em;
		white-space: nowrap;
	}

	@keyframes marquee {
		0% {
			transform: translate3d(var(--move-initial), 0, 0);
		}
		25% {
			transform: translate3d(var(--move-initial), 0, 0);
		}
		75% {
			transform: translate3d(var(--move-final), 0, 0);
		}
		100% {
			transform: translate3d(var(--move-final), 0, 0);
		}
	}
	.controls {
		gap: 1em;
	}
	.text-shadow {
		text-shadow: 0.1em 0.1em 0.2em rgba(0, 0, 0, 0.692), -0.1em -0.1em 0.2em rgba(0, 0, 0, 0.418);
	}
	.scroller {
		overflow-y: auto;
		// overflow-x: hidden;
		// background-color: rgb(18, 17, 24);
		overscroll-behavior: contain;
		// contain: paint
		// display: flex;
		overflow-y: auto;
		// touch-action: pan-y;
		transform: translate3d(0px, 0px, 0px);
		overflow-x: hidden;
		backface-visibility: hidden;
		contain: strict;
		// background-color: rgb(18, 17, 24);
		overscroll-behavior: contain;
		height: inherit;
		-webkit-overflow-scrolling: touch;
		// touch-action: none;
	}

	.immersive {
		position: absolute;
		inset: 0;
		z-index: -1;
		isolation: isolate;
		touch-action: none;
		pointer-events: none;
		overscroll-behavior: contain;

		&::after {
			content: "";
			position: absolute;
			inset: 0;
			z-index: 1;

			touch-action: none;
			overscroll-behavior: contain;
		}
		> img {
			object-fit: cover;
			height: 100%;
			overscroll-behavior: contain;

			min-width: 100vw;
			transform: scale(1.5);

			filter: brightness(0.6) opacity(0.6) contrast(1) saturate(1.1) blur(1em) grayscale(0.3) sepia(0.2);
			touch-action: none;
		}
	}
	.tracklist,
	.pad {
		position: absolute;

		bottom: 0;
		height: 100%;
		min-height: 0;
		background: var(--bottom-bg);
		overscroll-behavior: contain;
		touch-action: pan-y;
		// content-visibility: auto;

		border-top-left-radius: $sm-radius;
		border-top-right-radius: $sm-radius;
		contain: paint layout;
		@media screen and (min-width: 720px) {
			position: absolute;
			left: 0;
			width: 45vw;
			max-height: 100%;
			// transform: unset !important;
			height: 100% !important;
			// will-change: unset !important;
			transition: transform cubic-bezier(0.25, 0.46, 0.45, 0.94) 400ms;
			top: unset !important;
			border-top-left-radius: unset !important;
			border-top-right-radius: unset !important;
			// transition: unset !important;
		}
	}
	.fullscreen-player-popup {
		position: absolute;
		top: 0;
		height: 100%;
		width: 100%;
		// pointer-events: none;
		z-index: 1;
		grid-area: m;
		background: var(--base-bg);
		display: flex;
		isolation: isolate;
		touch-action: pan-y;

		transform: translate3d(0, 0vh, 0);
		will-change: transform, opacity;
		overscroll-behavior: contain;
		overflow: hidden;
		contain: strict;
		// transition: transform 400ms cubic-bezier(0.83, 0, 0.17, 1), opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);

		@media screen and (min-width: 720px) {
			// gap: 1em;
			flex-direction: row;
		}
	}
	hr {
		touch-action: none;

		&.horz::before {
			position: absolute;
			inset: 0;
			content: "";
			margin: auto;
			width: 25%;
			color: hsl(0deg 0% 80%);
			background: rgba(206, 206, 206, 0.308);
			height: 0.45em;
			border-radius: 3.6667em;

			line-height: inherit;
			z-index: 5;
		}
		&.vertical::before {
			position: absolute;
			inset: 0;
			opacity: 0;
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms opacity;
			content: "";
			margin: auto;
			height: 15%;
			color: hsl(0deg 0% 80%);
			background: rgba(206, 206, 206, 0.308);
			width: 0.45em;
			line-height: inherit;
			border-radius: 3.6667em;
			z-index: 100;
			transition-delay: 400ms;
		}
		&.vertical:hover::before {
			opacity: 1;
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms opacity;
		}
		overscroll-behavior: contain;
		width: 100%;
		border: none;
		position: relative;
		&.vertical {
			height: 100%;
		}
		// z-index: 100;
	}
	.mobile {
		min-height: 100% !important;
		margin-top: unset !important;
	}

	@keyframes fade-in {
		0% {
			background-color: #0000;
		}

		100% {
			background-color: hsla(0, 0%, 0%, 65%);
		}
	}
	.menu-mobile {
		position: absolute;
		top: 0;
		right: 0;
		margin: 1em;
		z-index: 155;
		max-width: 3em;
		max-height: 3em;
	}
	.backdrop {
		overscroll-behavior: contain;

		grid-area: m;
		position: fixed;
		isolation: isolate;
		display: grid;
		pointer-events: all;
		background-color: #0000;
		inset: 0;
		z-index: 151;
		animation: fade-in 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms alternate backwards;
		// transition-delay: 225ms;
		margin-top: var(--top-bar-height);
		height: calc(100% - calc(var(--top-bar-height) + var(--player-bar-height)));
		touch-action: none;

		max-height: 100vh;

		contain: strict;
		touch-action: pan-y;
		will-change: transform, opacity;

		// bottom: 0;
	}
	.album-art {
		margin-top: 7vh;
		overscroll-behavior: contain;
		height: 100%;
		display: grid;
		place-items: center;
		margin-bottom: 1em;
		width: 55vw;

		justify-content: center;
		max-width: 100%;
		@media screen and (max-width: 719px) {
			margin-bottom: 1em;
			width: 100%;
			height: unset;
		}
	}
	.img-container {
		display: grid;
		place-items: center;
		width: 100%;
		overscroll-behavior: contain;
		max-width: 100%;
		min-height: 0;

		position: relative;
		max-width: 100%;

		width: 100%;
		overscroll-behavior: contain;

		max-height: 35vh;
		@media screen and (max-width: 719px) {
			max-height: 28vh;
		}
		@media screen and (min-width: 1800px) {
			max-height: 45vh;
		}
	}
	.thumbnail {
		position: relative;
		overscroll-behavior: contain;
		max-height: inherit;
		height: 100%;
		min-height: 20vh;
		width: 100%;

		max-height: inherit;
		// position: absolute;
		img {
			touch-action: none;
			max-width: inherit;
			max-height: inherit;
			width: 100%;
			height: 100%;
			object-fit: contain;
			overscroll-behavior: contain;
			filter: drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.16));
		}
	}

	button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 100;
		// margin: 0.5em;
	}
	.horz {
		width: 100%;
		// border-top: 0.0175rem groove rgba(171, 171, 171, 0.151);
		border-top-left-radius: $sm-radius;
		border-top-right-radius: $sm-radius;
		height: 2.75em;
		padding-bottom: 0.0606em;
		padding-block: 0.7em;
		align-content: center;

		top: 0;
		left: 0;
		@media screen and (min-width: 720px) {
			display: none !important;
			visibility: none !important;
		}
	}
	.handle {
		overscroll-behavior: contain;

		// box-shadow: 0 -0.4rem 23px -17px hsl(0deg 0% 100% / 100%);
		z-index: 1;
		display: grid;
		cursor: pointer;
		padding: 0.12em;
		align-items: center;
		touch-action: none;
	}
	.handle.vertical {
		@media screen and (max-width: 719px) and (hover: hover) {
			display: none;
			visibility: none;
		}
		left: 0;
		position: absolute;
		transition: transform cubic-bezier(0.25, 0.46, 0.45, 0.94) 400ms;

		@media screen and (min-width: 720px) and (hover: hover) {
			place-items: center;
			width: 2.5em;
			height: 100%;
			padding-right: 0.0606em;
			place-items: center;
		}
	}
</style>
