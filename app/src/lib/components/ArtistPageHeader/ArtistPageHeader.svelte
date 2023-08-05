<script lang="ts">
	import { browser } from "$app/environment";
	import Icon from "$lib/components/Icon/Icon.svelte";
	import type { ArtistPage } from "$lib/parsers";
	import list from "$lib/stores/list";
	import { debounce, throttle } from "$lib/utils";
	import { isDesktopMQ, windowHeight, windowWidth } from "$stores/window";
	import { onMount } from "svelte";
	import { cubicOut } from "svelte/easing";
	import { tweened } from "svelte/motion";
	import Description from "./Description";

	export let header: ArtistPage["header"];
	export let thumbnail = [];
	export let description = "";
	let container: HTMLDivElement = undefined;
	let y = 1;
	let wrapper: HTMLElement;
	let isExpanded = false;
	let timestamp = 0;

	let opacity = 0;
	let img: HTMLImageElement;
	let isScrolling = false;
	let calc: number;
	const scale = tweened(1, { duration: 300, easing: cubicOut });
	const debounced = debounce(() => (isScrolling = false), 200);
	const handleScrollEnd = throttle(debounced, 100);

	const handler = (ts: number) => {
		if (!browser && !container) return;

		calc = (wrapper.scrollTop / $windowHeight) * 2 || 0;

		scale.update(() =>
			$windowWidth < 500
				? Math.max(calc * 3, 1)
				: Math.min(5, Math.max(1, calc * 4)),
		);
		if (!isScrolling) {
			return;
		}
		timestamp = requestAnimationFrame(handler);
	};

	function onScroll(event: UIEvent) {
		handleScrollEnd();
		if (timestamp) {
			return;
		}
		if (isScrolling) return;
		isScrolling = true;

		timestamp = requestAnimationFrame(handler);
	}

	onMount(() => {
		if (img) {
			img.decode().then(() => {
				opacity = 1;
			});
		}

		wrapper = document.getElementById("wrapper");
		wrapper.addEventListener("scroll", onScroll, {
			passive: true,
			capture: true,
		});
		return () => {
			if (timestamp) cancelAnimationFrame(timestamp);
			wrapper.removeEventListener("scroll", onScroll, true);
		};
	});
</script>

<div class="artist-header">
	<div
		class="artist-thumbnail"
		style="{isExpanded
			? 'background-color: rgba(0, 0, 0, 0.4) !important'
			: ''};"
	>
		<div
			bind:this={container}
			style={`background-image: linear-gradient(0deg, var(--base-bg) -${
				6 + 0.6 * cubicOut($scale)
			}%, var(--base-bg) ${
				(20 + -$scale) * 0.5
			}%, var(--base-bg-opacity-1_2) 35%, var(--base-bg-opacity-1_2) 40%, transparent);  --scale: ${Math.abs(
				$scale,
			)};`}
			id="gradient"
			class="gradient"
		/>
		<picture class="header-thumbnail">
			{#each thumbnail as img, i (img)}
				{#if i === 0}
					<source
						media="(max-width:{img.width}px)"
						srcset={img.url}
						type="image/jpeg"
					/>
					<source
						media={`(min-width:${img.width + 1}px) and (max-width:${
							thumbnail[i + 1].width
						}px)`}
						srcset={img.url}
						type="image/jpeg"
					/>
				{:else if i === thumbnail.length - 1}
					<!-- -->
				{:else}
					<source
						media={`(min-width:${img.width + 1}px) and (max-width:${
							thumbnail[i + 1].width
						}px)`}
						srcset={thumbnail[i + 1].url}
						type="image/jpeg"
					/>
				{/if}
			{/each}
			<img
				bind:this={img}
				class="header-thumbnail"
				style="opacity:{opacity};"
				loading="eager"
				src={thumbnail[1]?.url}
				id="artist_img"
				alt="Artist Thumbnail"
			/>
		</picture>
		<div class="artist-content">
			<div
				class="content-wrapper"
				class:row={header?.foregroundThumbnails}
			>
				{#if header?.foregroundThumbnails}
					<picture>
						{#each header?.foregroundThumbnails as img, i (img)}
							{#if i === 0}
								<source
									media="(max-width:{img?.width}px)"
									srcset={img?.url}
									type="image/jpeg"
								/>
								<source
									media={`(min-width:${img?.width + 1}px) and (max-width:${
										header?.foregroundThumbnails[i + 1].width
									}px)`}
									srcset={img?.url}
									type="image/jpeg"
								/>
							{:else if i === header?.foregroundThumbnails.length - 1}
								<!---->
							{:else}
								<source
									media={`(min-width:${img?.width + 1}px) and (max-width:${
										header?.foregroundThumbnails[i + 1].width
									}px)`}
									srcset={header?.foregroundThumbnails[i + 1].url}
									type="image/jpeg"
								/>
							{/if}
						{/each}
						<img
							class="content-thumbnail"
							loading="eager"
							src={header?.foregroundThumbnails[1]?.url}
							alt="Artist Thumbnail"
						/>
					</picture>
				{/if}
				<div class="name">{header?.name}</div>
				{#if $isDesktopMQ && description}
					<Description
						{description}
						on:update={(e) => {
							isExpanded = e.detail;
						}}
					/>
				{/if}
				<div class="btn-wrpr">
					{#if header?.buttons.radio !== null}
						<button
							on:click={() =>
								list.initAutoMixSession({
									config: { playerParams: header.buttons.radio?.params },
									playlistId: header.buttons.radio?.playlistId,
								})}
							><Icon
								size="1.25em"
								name="radio"
							/><span class="button-text"> Play Radio</span></button
						>
					{/if}
					{#if header?.buttons.shuffle !== false}
						<button
							class="outlined"
							on:click={() =>
								list.initAutoMixSession({
									videoId: header.buttons.shuffle?.videoId,
									config: { playerParams: header.buttons.shuffle?.params },
									playlistId: header.buttons.shuffle?.playlistId,
								})}
							><Icon
								size="1.25em"
								name="shuffle"
							/><span class="button-text"> Shuffle</span></button
						>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<!--  -->
<style lang="scss">
	@import "./index.scss";

	.hidden {
		display: none !important;
	}

	.modal {
		position: absolute;
		inset: 0% 0 0 0%;
		width: 80%;
		align-self: center;
		max-height: 100%;
		overflow-y: scroll;
		margin: auto;
		padding: 1rem;
		z-index: 5;
		height: 80%;
		border-radius: var(--md-radius);
		background: var(--color-med);
	}

	.modal-wrapper {
		position: fixed;
		inset: 0% 0 0 0%;
		width: 100%;
		height: 100%;
		z-index: 5;

		&::before {
			background: rgb(0 0 0 / 43.8%);
			position: absolute;
			z-index: -1;
			inset: 0;
			content: "";
			width: 100%;
			height: 100%;
			backdrop-filter: blur(0.05rem);
		}
	}

	.row {
		flex-direction: row !important;
		align-items: center !important;
		gap: 1.2rem;
	}

	.artist-header {
		display: block;
		position: relative;
	}

	.artist-thumbnail {
		display: block;
		position: relative;
		height: 100%;
		padding-top: 33vh;
		overflow: hidden;
		transition: background-color 0.8s cubic-bezier(0.19, 0, 0.7, 1);
		background-color: rgb(0 0 0 / 10%);

		@media only screen and (min-width: 1080px) and (max-width: 1600px) {
			padding-top: 30vh;
		}

		@media only screen and (min-width: 1601px) {
			padding-top: 33vh;
		}

		&::before {
			position: absolute;
			content: "";
			inset: 0;
		}
	}

	.gradient {
		z-index: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		inset: 0;
		contain: content;
		will-change: transform;
		transform-origin: bottom;
		transform: scaleY(var(--scale));
		&::before {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			z-index: -5;
			content: "";
		}
	}

	.header-thumbnail {
		z-index: -1;
		top: 0;
		width: 100%;
		height: 100%;
		max-height: 100%;
		object-fit: cover;
		position: absolute;
		transition: opacity 0.75s linear;
		overflow: hidden;
		border-radius: 0;
		object-position: top;
	}

	.artist-content {
		position: relative;
		z-index: 1;

		@include content-spacing($type: "padding");
		@include content-width();

		padding-bottom: 0 !important;
		margin: 0 auto;

		.content-wrapper {
			display: inline-flex;
			flex-flow: column wrap;
			align-items: flex-start;
			width: 80%;

			.content-thumbnail {
				max-width: 6rem;
				max-height: 6rem;
			}

			.name {
				font-weight: 700;
				font-size: 2.5rem;
				display: inline-block;
				font-family: "Commissioner Variable", sans-serif;
				text-shadow: rgb(0 0 0 / 17.1%) 0.2rem -0.12rem 0.5rem;
				letter-spacing: -0.02em;
				padding-bottom: 1rem;

				@media screen and (min-width: 642px) and (max-width: 839px) {
					font-size: 2rem;
				}

				@media screen and (min-width: 840px) and (max-width: 960px) {
					font-size: 3.5rem;
					inline-size: 100%;
					overflow-wrap: break-word;
				}

				@media screen and (min-width: 961px) {
					font-size: 4.5rem;
				}
			}
		}

		max-width: $content-width-mobile;

		@media only screen and (min-width: 1080px) and (max-width: 1366px) {
			max-width: $content-width-md;
		}

		@media only screen and (min-width: 1367px) and (max-width: 1600px) {
			max-width: $content-width-lg;
		}

		@media only screen and (min-width: 1601px) {
			max-width: $content-width-xl;
		}
	}
</style>
