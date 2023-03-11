<script
	context="module"
	lang="ts"
>
	const RE_THUMBNAIL_DIM = /=w\d+-h\d+-/gm;
</script>

<script lang="ts">
	import { draggable } from "$lib/actions/draggable";
	import list, { currentTrack } from "$lib/stores/list";
	import { tick } from "svelte";

	import { quartOut } from "svelte/easing";
	import { tweened } from "svelte/motion";
	import { fly } from "svelte/transition";
	import Icon from "../Icon/Icon.svelte";
	import { activeNode, PopperStore } from "./popperStore";

	$: items = $PopperStore.items;
	$: type = $PopperStore.type;

	let sliding;

	let queueHeight = 0;
	let windowHeight = 0;

	$: heightCalc = windowHeight - queueHeight * 0.5;

	let backdrop: HTMLDivElement;
	let tracklist: HTMLDivElement = undefined;
	$: isOpen = !!items.length;
	const motion = tweened(0, {
		duration: 640,
		easing: quartOut,
	});

	function onDragStart(kind, { detail }) {
		sliding = true;
	}

	function release(kind: number, detail) {
		if (sliding) {
			if (Math.sign(detail.velocityY) < 0) {
				open(kind, detail);
			} else {
				close(kind, detail);
			}
		}
	}

	function trackMovement(kind: number, detail) {
		if (kind === 1) {
			motion.set(Math.min(heightCalc, Math.max(0, detail.clientY - 8)), { duration: 180 });
		}
	}

	function open(kind: number, detail) {
		const step = detail.deltaY / queueHeight;
		const miss = detail.velocityY >= 0 && detail.velocityY > 0.2 ? 1 - step : 1 - step;
		const distance = miss * windowHeight;
		motion.update(
			() => {
				return 0;
			},
			{
				duration: Math.min(distance / Math.abs(detail.velocityY), 300),
			},
		);
	}

	async function close(kind: number, detail) {
		const step = detail.deltaY / queueHeight;
		const miss = detail.velocityY >= 0 && detail.velocityY > 0.2 ? 1 - step : step;
		const distance = miss * windowHeight;
		if (kind === 1) {
			motion.set(windowHeight, {
				duration: Math.min(distance / Math.abs(detail.velocityY), 640),
			});
		}
		sliding = false;
		await tick();
		isOpen = false;
		await handleBackdropClick();
	}

	async function handleBackdropClick() {
		const anim = backdrop.animate(
			[
				{ backgroundColor: "hsla(0, 0%, 0%, 55%)", opacity: 1 },
				{ backgroundColor: "#0000", opacity: 0 },
			],
			{
				duration: 600,
				delay: 300,
				fill: "forwards",
				direction: "normal",
				easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
				composite: "replace",
			},
		);
		anim.onfinish = () => {
			PopperStore.reset();
			activeNode.set(null);
		};
		anim.play();
	}

	$: {
		if (items.length !== 0) {
			motion.update(
				(t, v) => {
					return 0;
				},
				{
					duration: 500,
					easing: quartOut,
				},
			);
			if (backdrop) {
				const anim = backdrop.animate(
					[
						{ backgroundColor: "#0000", opacity: 0 },
						{ backgroundColor: "hsla(0, 0%, 0%, 55%)", opacity: 1 },
					],
					{
						duration: 600,
						fill: "forwards",
						direction: "normal",
						easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
						composite: "replace",
					},
				);
				anim.onfinish = () => {
					isOpen = true;
				};
				anim.play();
			}
		} else if (items.length === 0) {
			motion.update(() => windowHeight, { duration: 600, easing: quartOut, delay: 400 });
		}
	}
	$: srcImg = Array.isArray($PopperStore.metadata?.thumbnail ?? $PopperStore.items[0]?.thumbnails)
		? $PopperStore.metadata?.thumbnail[0] ?? $PopperStore.items[0]?.thumbnails
		: { width: 0, height: 0, url: "", placeholder: "" };

	$: srcImg.url = srcImg.width < 100 ? srcImg.url.replace(RE_THUMBNAIL_DIM, "=w240-h240-") : srcImg.url;
</script>

{#if isOpen}
	<div
		class="fixed"
		bind:clientHeight={windowHeight}
	>
		<div
			class="backdrop"
			bind:this={backdrop}
			on:click|stopPropagation={handleBackdropClick}
		/>
		<div
			class="column container drag"
			bind:this={tracklist}
			in:fly={{ duration: 600, delay: 300, opacity: 0, y: windowHeight }}
			out:fly={{ duration: 600, y: windowHeight, opacity: 0 }}
			bind:clientHeight={queueHeight}
			style={`transform: translate3d(0, ${$motion}px, 0);  bottom:0;`}
		>
			<div
				use:draggable
				on:pointerdown|stopPropagation={() => {
					tracklist.style.willChange = "scroll-position, transform";
				}}
				on:dragstart|capture|stopPropagation={(e) => onDragStart(1, e)}
				on:dragmove|capture|stopPropagation={(e) => trackMovement(1, e.detail)}
				on:dragend|capture|stopPropagation={(e) => release(1, e.detail)}
				class="handle"
			>
				<hr class="horz" />
			</div>
			{#if type === "player"}
				<section class="m-metadata">
					<div
						class="image"
						style=""
					>
						<img
							decoding="async"
							src={srcImg.url}
							width={srcImg.width}
							height={srcImg.height}
							alt={$currentTrack?.title}
						/>
					</div>
					<div class="metatext">
						<span class="title">{$list.mix[$list.position].title}</span>
						<span class="artist">
							{$list.mix[$list.position].artist
								? $list.mix[$list.position].artist
								: $list.mix[$list.position].artistInfo.artist[0].text}
						</span>
						<span class="length">
							<span class="subheading">Now playing</span>
						</span>
					</div>
				</section>
			{/if}
			{#if type === "search" && $PopperStore.metadata?.artist !== undefined && $PopperStore.metadata.artist.length}
				<section class="m-metadata">
					<div class="image">
						<img
							decoding="async"
							src={srcImg.url}
							width={srcImg.width}
							height={srcImg.height}
							alt=""
						/>
					</div>
					<div class="metatext">
						<span class="title">{$PopperStore.metadata.title}</span>
						{#each $PopperStore.metadata?.artist as artist}
							<span class="secondary"> {artist.text ?? ""}</span>
						{/each}
						<span />
						{#if $PopperStore.metadata?.length}
							<span class="length secondary">
								{$PopperStore.metadata?.length ?? ""}
							</span>
						{/if}
					</div>
				</section>
			{/if}
			<div class="list-wrapper">
				<ul>
					{#each items as item}
						<li on:click={item?.action}>
							<Icon
								name={item?.icon}
								color="#f2f2f2"
								size="1.5em"
							/>
							<span class="text">{item?.text}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.m-metadata {
		display: flex;
		max-width: 93%;
		margin-bottom: 0.3125em;
		width: 100%;
		margin: 0 auto;
		gap: 1em;
		border-radius: 0.3125em;
		padding: 1em;
		// flex: 1 0 auto;
		align-items: center;
		background-color: #4e4e4e27;
		box-shadow: 0px 0px 14px -11px #000;
		height: auto;
		:where(.image) {
			// height: auto !important;
			flex: 1 0 auto;
			// height: 0 !important;
			object-fit: scale-down;
			max-width: 33%;
			max-height: 33%;
			img {
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
			// height: auto;
		}
	}

	.metatext {
		display: flex;
		flex-direction: column;
		// justify-content: center;
		// gap: 0.5em;
		> :where(.title) {
			margin-bottom: 0.3125em;
		}
	}

	.fixed {
		inset: 0;
		height: 100vh;
		height: 100dvh;
		width: 100%;
		position: fixed;
		touch-action: pan-y;
		z-index: 1000;
	}

	@keyframes fade-in {
		0% {
			background-color: #0000;
			opacity: 0;
		}

		100% {
			background-color: hsla(0, 0%, 0%, 0.55);
			opacity: 1;
		}
	}
	.backdrop {
		overscroll-behavior: contain;

		position: fixed;
		isolation: isolate;
		display: grid;
		background-color: hsla(0, 0%, 0%, 0);
		inset: 0;
		z-index: 151;
		// margin-top: var(--top-bar-height);
		touch-action: pan-y;
		bottom: 0;
		max-height: 100vh;

		contain: strict;
		will-change: transform, opacity;
		opacity: 0;
		// bottom: 0;
	}

	.drag {
		position: absolute;

		bottom: 0;

		min-height: 0;
		background: var(--bottom-bg-light);
		overscroll-behavior: contain;
		touch-action: pan-y;
		// content-visibility: auto;
		z-index: 1100;
		// display: block !important;
		margin-inline: auto;
		// max-width: 95%;
		// flex-direction: row;
		will-change: transform, visibility;
		width: 95%;
		align-items: center;
		// flex-direction: column;
		border-top-left-radius: 0.75em;
		border-top-right-radius: 0.75em;
		contain: paint layout;
		// inset: 0;
		left: 0;
		right: 0;
		max-height: calc(100% - calc(var(--top-bar-height) + var(--player-bar-height)));
		max-height: 80%;
		padding-bottom: 0.3125em;
	}
	hr {
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

	.horz {
		width: 100%;
		// border-top: 0.0175rem groove rgba(171, 171, 171, 0.151);
		border-top-left-radius: $sm-radius;
		border-top-right-radius: $sm-radius;
		// height: 2.75rem;
		padding-block: 0.7em;
		align-content: center;
		display: inline-block;
		align-self: center;
		top: 0;
		left: 0;
		@media screen and (min-width: 720px) {
			display: none !important;
			visibility: none !important;
		}
	}
	.handle {
		overscroll-behavior: contain;
		width: 100%;

		// box-shadow: 0 -0.4rem 23px -17px hsl(0deg 0% 100% / 100%);
		z-index: 1;
		display: grid;
		display: inline-block;
		cursor: pointer;
		// padding: 0.12em;
		align-items: center;
		vertical-align: middle;
	}
	.list-wrapper {
		&::after {
			position: absolute;
			bottom: 0;
			height: 0.5em;
			box-shadow: 0 0 4px #000;
			content: "";
		}
		position: relative;
		width: 100%;
		padding: 0.25em;
		overflow-y: scroll;

		&::-webkit-scrollbar {
			width: 0;
			height: 0;
		}

		&::-webkit-scrollbar-track {
			border-radius: 0.625rem;
			height: 0;
			width: 0%;
			background-clip: content-box;
			border-radius: 0.833333rem;
			border: transparent solid 0.0983333rem;
		}

		&::-webkit-scrollbar-thumb {
			background-color: #424242c4;
			border-radius: 0;
			width: 0;
			scrollbar-width: 0;
			border: 0 solid #b8b8b800;
			background-clip: content-box;
		}
	}
	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		padding: 0;
		max-width: 95%;
		width: 100%;
		margin: 0 auto;

		// height: 100%;
	}

	li {
		padding: 1.25em 1em;
		border-radius: 0.3125em;
		margin-top: 0.3125em;
		font-size: 1rem;
		line-height: 1.5;
		margin-bottom: 0.25em;
		flex: 0 1 auto;
		color: #f3f3f3;
		display: flex;
		background-color: #4e4e4e27;
		box-shadow: 0px 0px 14px -11px #000;
		gap: 0.5rem;
		transition: background-color 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
		&:active {
			background-color: #4e4e4e3c;
		}
	}
</style>
