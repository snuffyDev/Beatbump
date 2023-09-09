<script lang="ts">
	import { navigating } from "$app/stores";
	import Description from "$components/ArtistPageHeader/Description/Description.svelte";
	import Carousel from "$components/Carousel/Carousel.svelte";
	import DraggableList from "$components/DraggableList/DraggableList.svelte";
	import PopperButton from "$components/Popper/PopperButton.svelte";
	import { draggable } from "$lib/actions/draggable";
	import { pan } from "$lib/actions/gestures/handlers";
	import type { Dropdown } from "$lib/configs/dropdowns.config";
	import { CTX_ListItem } from "$lib/contexts";
	import { AudioPlayer, getSrc } from "$lib/player";
	import {
		immersiveQueue,
		isMobileMQ,
		isPagePlaying,
		playerLoading,
	} from "$lib/stores";
	import {
		currentTrack,
		queue,
		queuePosition,
		related,
	} from "$lib/stores/list";
	import { groupSession } from "$lib/stores/sessions";
	import type { Thumbnail } from "$lib/types";
	import { requestFrameSingle } from "$lib/utils";
	import SessionListService from "$stores/list/sessionList";
	import { SITE_ORIGIN_URL } from "$stores/url";
	import { windowWidth } from "$stores/window";
	import { cubicOut, quartIn, quartOut } from "svelte/easing";
	// eslint-disable-next-line import/no-duplicates
	import { tweened } from "svelte/motion";
	import {
		fade,
		type EasingFunction,
		type TransitionConfig,
	} from "svelte/transition";
	import ListItem, { listItemPageContext } from "../ListItem/ListItem.svelte";
	import Loading from "../Loading/Loading.svelte";
	import Tabs from "../Tabs";
	import Controls from "./Controls.svelte";
	import { createPlayerPopperMenu } from "./Player.svelte";
	import ProgressBar from "./ProgressBar";
	import blurURL from "./blur.svg?url";
	import { fullscreenStore } from "./channel";

	export let state: "open" | "closed";

	const { paused } = AudioPlayer;

	$: isPlaying = $paused;
	let windowHeight = 0,
		queueHeight = 0,
		sliding = false;
	let DropdownItems: Dropdown;
	let titleWidth = 320;
	let active = "UpNext";
	let thumbnail: Thumbnail;
	let tracklist: HTMLDivElement;
	let rmContextFn: (() => void) | undefined = undefined;

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

	const motion = tweened(-36, {
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
			motion.set(Math.min(48, Math.max(heightCalc, detail.clientY - 8)), {
				duration: 180,
			});
		} else {
			queueTween.set(
				0 - (detail.clientY * 0.7 + detail.clientY * 0.3) / windowHeight,
				{ duration: 180 },
			);
		}
	}

	function open(kind: number, detail) {
		const step = detail.deltaY / queueHeight;
		const miss =
			detail.velocityY >= 0 && detail.velocityY > 0.2 ? 1 - step : 1 - step;
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
		const miss =
			detail.velocityY >= 0 && detail.velocityY > 0.2 ? 1 - step : step;
		const distance = miss * windowHeight;
		if (kind === 1) {
			motion.set(-36, {
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
		if (state === "open") {
			rmContextFn = listItemPageContext.add("queue");
		}
		if (state === "closed") {
			if (rmContextFn) {
				rmContextFn();
				rmContextFn = undefined;
				isPagePlaying.remove("player-queue");
			}
		}
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

	$: if ($navigating !== null) {
		(() => {
			fullscreenStore.set("closed");
			$motion = 0;
			$queueTween = 0;
		})();
	}

	function slideInOut(
		node: HTMLElement,
		{
			duration = 400,
			delay = 400,
			easing = quartOut,
		}: { duration?: number; easing?: EasingFunction; delay?: number },
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

	$: console.log($queue);
</script>

{#if $queue.length && state === "open"}
	{#if $immersiveQueue}
		<div
			class="immersive"
			class:open={queueOpen}
			in:fade|global={{ duration: 200, delay: 200, easing: quartIn }}
			out:fade|global={{ duration: 800, delay: 500, easing: quartIn }}
			style="

--svg: url({new URL(
				blurURL + '#blur',
				import.meta.url,
			)}); --background-image: url({thumbnail.url}); transform: scale({state ===
				'open' || queueOpen
				? $isMobileMQ
					? 2
					: 1.5
				: $isMobileMQ
				? 4
				: 2.2}); --blur: {queueOpen ? 2 : 8}px;"
		/>
	{/if}
	<div
		class="backdrop"
		class:mobile={$isMobileMQ}
		bind:clientHeight={windowHeight}
		style:pointer-events={state === "open" ? "all" : "none"}
	>
		<div
			class="fullscreen-player-popup"
			in:slideInOut|global={{ duration: 400 }}
			out:slideInOut|global={{ delay: 300, duration: 300, easing: quartIn }}
		>
			<div
				class="column container"
				use:pan
				on:pan={(event) => {
					if (!$isMobileMQ) return;
					const { detail } = event;
					if (Math.abs(detail.deltaY) < 65) return;
					trackMovement(0, detail);
				}}
				on:panend={(event) => {
					if (!$isMobileMQ) return;
					const { detail } = event;
					const direction = Math.sign(detail.deltaY) === -1 ? "up" : "down";

					if (Math.abs(detail.deltaY) < 65) return;
					if (direction === "down") {
						close(0, detail);
						fullscreenStore.set("closed");
					} else {
						open(0, detail);
					}
				}}
			>
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
								src={thumbnail?.url ?? ""}
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
									style="animation-play-state: {state === 'open' &&
									titleWidth > $windowWidth
										? 'running'
										: 'paused'}; {titleWidth < $windowWidth
										? 'animation: none; transform: unset;'
										: ''}"
									><span
										bind:clientWidth={titleWidth}
										class="h5 marquee-text">{data?.title}</span
									></span
								>
							</div>
							<span
								class="h6"
								style="text-align:center; "
								>{data?.artistInfo && data?.artistInfo.artist.at(0)
									? data?.artistInfo.artist.at(0).text
									: ""}</span
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
							bind:isPaused={isPlaying}
							bind:loading={$playerLoading}
							on:play={() => AudioPlayer.play()}
							isQueue={true}
							pause={() => AudioPlayer.pause()}
							nextBtn={() => {
								if ($queue.length === 0) return;
								SessionListService.next();
								// AudioPlayer.updateTime($durationStore);
							}}
							prevBtn={() => SessionListService.previous()}
						/>
					</div>
				{/if}
			</div>

			<div
				class="handle vertical"
				style="transform: translate3d({queueOpen
					? 53.5
					: 91.5}vw, 0, 0) !important;"
				on:pointerdown={() => {
					requestFrameSingle(() => {
						tracklist.style.willChange = "transform";
					});
				}}
				on:pointerup={() => {
					setTimeout(() => {
						requestFrameSingle(() => {
							tracklist.style.willChange = "unset";
						});
					}, 200);
					queueOpen = !queueOpen;
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
					: `transform: translate3d(${
							queueOpen ? 55 : 93
					  }vw, 0px, 0) !important;`}
			>
				<div
					use:draggable
					on:bb-dragstart|capture|stopPropagation={(e) => onDragStart(1, e)}
					on:bb-dragmove|capture|stopPropagation={(e) =>
						trackMovement(1, e.detail)}
					on:bb-dragend|capture|stopPropagation={(e) => release(1, e.detail)}
					on:pointerdown={() => {
						tracklist.style.willChange = "top transform";
					}}
					on:pointerup={() => {
						setTimeout(() => {
							requestFrameSingle(() => {
								tracklist.style.willChange = "unset";
							});
						}, 200);
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
								<div
									class="scroller"
									on:touchstart|stopPropagation={null}
								>
									<DraggableList
										items={$queue}
										on:dragend={() => {
											if ($groupSession.hasActiveSession)
												groupSession.updateGuestTrackQueue($SessionListService);
										}}
									>
										<ListItem
											let:index
											let:item
											draggable
											{item}
											idx={index}
											slot="item"
											on:setPageIsPlaying={async ({ detail }) => {
												if (isPagePlaying.has("player-queue")) {
													if ($queue.length && $SessionListService) {
														getSrc(item.videoId, undefined, undefined, true);
													}
													SessionListService.updatePosition(detail.index);
													return;
												}
												isPagePlaying.add("player-queue");
											}}
										/>
									</DraggableList>
								</div>
							{/if}
						{:else if isActive}
							<div class="scroller">
								<div class="pad">
									{#if $related.description.description}
										<div class="mb-2">
											<span class="h2">{$related?.description?.header}</span>
											<Description
												description={$related.description.description}
											/>
										</div>
									{/if}
									{#if Array.isArray($related.carousels)}
										{#key $related.carousels}
											{#each $related.carousels as carousel}
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

<svg
	xmlns="http://www.w3.org/2000/svg"
	height="0"
>
	<defs>
		<filter
			id="blur"
			x="0"
			y="0"
		>
			<feGaussianBlur
				in="SourceGraphic"
				stdDeviation="5"
			/>
		</filter>
	</defs>
</svg>

<style lang="scss">
	.pad {
		padding: 2vh 1em 1.5em;
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
		text-shadow: 0.1em 0.1em 0.2em rgb(0 0 0 / 69.2%),
			-0.1em -0.1em 0.2em rgb(0 0 0 / 41.8%);
	}

	.scroller {
		overflow-y: auto;
		transform: translate3d(0, 0, 0);
		overflow-x: hidden;
		backface-visibility: hidden;
		contain: strict;
		overscroll-behavior: contain;
		height: inherit;
		-webkit-overflow-scrolling: touch;
	}

	.immersive {
		position: absolute;
		inset: 0;
		z-index: 1;
		isolation: isolate;
		touch-action: none;
		pointer-events: none;
		overscroll-behavior: contain;
		contain: style;
		perspective: 1000px;
		backface-visibility: hidden;
		overflow: hidden;

		// mask-composite: ;
		@media screen and (max-width: 720px) {
			position: fixed;
			z-index: 151;
			left: 0;
			top: 0;
			// background-repeat: no-repeat !important;
			background-size: 50% 50% !important;
			// top: 50%;
		}

		transform: scale(var(--scale)) translate3d(0, 0, 0);
		transition: backdrop-filter cubic-bezier(0.895, 0.03, 0.685, 0.22) 1600ms
			800ms;
		transition-delay: 800ms;
		transition-property: background-color transform filter backdrop-filter;
		transition-duration: 1600ms;
		background-color: hsl(0deg 0% 0%);

		&.open {
			// backdrop-filter: brightness(0.6) opacity(1) contrast(1) saturate(1.1) grayscale(0.3) sepia(0.2) url(1rem);
			background-color: hsl(0deg 0% 0% / 58.7%);
			&::after {
				transition-delay: 800ms;
			}
		}

		&::after {
			content: "";
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;

			// border-radius: 9999rem;
			z-index: 1;
			touch-action: none;
			overscroll-behavior: contain;
			perspective: 1000px;
			backface-visibility: hidden;
			// overflow: hidden;
			will-change: opacity, top;
			transform: scale(var(--scale)) translate3d(0, 0, 0);
			transition: backdrop-filter cubic-bezier(0.25, 0.46, 0.45, 0.94);
			transition-property: background-color, transform, filter, backdrop-filter;
			transition-duration: 500ms;
			transition-delay: 1000ms;

			@media screen and (max-width: 720px) {
				position: absolute;
				max-width: 100%;
				// z-index: -1;
				left: 0;
				top: 0;
				// background-repeat: no-repeat !important;
				background-size: 100vh !important;
				// top: 50%;
				background-attachment: scroll;
				background-position: center;
			}

			background-image: var(--background-image);
			box-shadow: 0 0 100px -20px #000000d5 inset, 0 0 50rem 5px #000000c9;
			filter: brightness(0.9) opacity(1) contrast(1) saturate(1.7)
				grayscale(0.35) sepia(0.2) blur(var(--blur, 4px));

			// mask-image: url(#blur);
			// mask-size: 100% 100%;
		}

		> img {
			object-fit: cover;
			height: 100%;
			overscroll-behavior: contain;
			width: 100%;
			position: absolute;
			backface-visibility: hidden;
			inset: 0;
			overflow: hidden;
			will-change: filter, visibility;
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
		contain: paint layout style;

		@media screen and (min-width: 720px) {
			position: absolute;
			left: 0;
			width: calc(45vw);
			max-height: 100%;
			// transform: unset !important;
			height: 100% !important;
			// will-change: unset !important;
			transition: transform cubic-bezier(0.25, 0.46, 0.45, 0.94) 400ms;
			top: unset !important;
			border-top-left-radius: unset !important;
			border-top-right-radius: unset !important;
		}
	}

	.tracklist {
		box-shadow: 0px 5px 32px -10px #000;
	}
	.fullscreen-player-popup {
		position: absolute;
		top: 0;
		height: 100%;
		width: 100%;
		z-index: 1;
		grid-area: m;

		&::before {
			position: absolute;
			content: "";
			inset: 0;
			opacity: 0.2;
			background: var(--base-bg);
		}

		display: flex;
		isolation: isolate;
		touch-action: pan-y;
		transform: translate3d(0, 0, 0);
		will-change: transform, opacity;
		overscroll-behavior: contain;
		overflow: hidden;
		contain: strict;

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
			background: rgb(206 206 206 / 30.8%);
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
			background: rgb(206 206 206 / 30.8%);
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
			background-color: hsl(0deg 0% 0% / 58.7%);
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
		animation: fade-in 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms
			alternate forwards;
		margin-top: var(--top-bar-height);
		height: calc(100% - calc(var(--top-bar-height) + var(--player-bar-height)));
		max-height: 100vh;
		contain: strict;
		touch-action: pan-y;
		will-change: transform, opacity;
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
		min-height: 0;
		position: relative;
		max-width: 100%;
		width: 100%;
		overscroll-behavior: contain;
		max-height: 35vh;
		box-shadow: 0px 0px 38px -18px #000;

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
		height: 100%;
		min-height: 20vh;
		width: 100%;
		max-height: inherit;

		img {
			touch-action: none;
			max-width: inherit;
			max-height: inherit;
			width: 100%;
			height: 100%;
			object-fit: contain;
			overscroll-behavior: contain;
			filter: drop-shadow(0 0 12px rgb(0 0 0 / 16%));
		}
	}

	button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 100;
	}

	.horz {
		width: 100%;
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
			width: 2.5em;
			height: 100%;
			padding-right: 0.0606em;
			place-items: center;
		}
	}
</style>
