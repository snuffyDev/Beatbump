<script lang="ts">
	import list from "$lib/stores/list";
	import Icon from "$lib/components/Icon/Icon.svelte";
	import { onMount } from "svelte";
	import type { ArtistPage } from "$lib/parsers";
	import { browser } from "$app/environment";
	import Description from "./Description";
	import { isDesktopMQ } from "$stores/window";

	export let header: ArtistPage["header"];
	export let thumbnail = [];
	export let description: string = "";
	let container: HTMLDivElement = undefined;
	let y = 0;
	let wrapper: HTMLElement;
	let isExpanded = false;
	let timestamp = 0;

	let opacity = 0;
	let img: HTMLImageElement;

	const handler = () => {
		if (!browser && !container) return;

		const scroll = container.getBoundingClientRect();
		const calc = -scroll.top / window.innerHeight;
		y = window.innerWidth < 500 ? Math.min(Math.max(calc, 0), 1) * 325 : Math.min(Math.max(calc, 0), 1) * 116;
	};

	function onScroll(event: UIEvent) {
		cancelAnimationFrame(timestamp);
		timestamp = requestAnimationFrame(handler);
	}
	onMount(() => {
		let start;
		if (img) {
			img.decode().then(() => {
				opacity = 1;
			});
		}

		wrapper = document.getElementById("wrapper");
		wrapper.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			if (timestamp) cancelAnimationFrame(timestamp);
			wrapper.removeEventListener("scroll", onScroll);
		};
	});
</script>

<div class="artist-header">
	<div class="artist-thumbnail" style="{isExpanded ? 'background-color: rgba(0, 0, 0, 0.4)' : ''};">
		<div
			bind:this={container}
			style={`background-image: linear-gradient(1turn, var(--base-bg) ${Math.min(
				Math.max(0, y),
				100,
			)}%, transparent); transition: cubic-bezier(0.6, -0.28, 0.74, 0.05) background 120ms`}
			id="gradient"
			class="gradient"
		/>
		<picture class="header-thumbnail">
			{#each thumbnail as img, i (img)}
				{#if i == 0}
					<source media="(max-width:{img.width}px)" srcset={img.url} type="image/jpeg" />
					<source
						media={`(min-width:${img.width + 1}px) and (max-width:${thumbnail[i + 1].width}px)`}
						srcset={img.url}
						type="image/jpeg"
					/>
				{:else if i == thumbnail.length - 1}
					<!-- -->
				{:else}
					<source
						media={`(min-width:${img.width + 1}px) and (max-width:${thumbnail[i + 1].width}px)`}
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
			<div class="content-wrapper" class:row={header?.foregroundThumbnails}>
				{#if header?.foregroundThumbnails}
					<picture>
						{#each header?.foregroundThumbnails as img, i (img)}
							{#if i == 0}
								<source media="(max-width:{img?.width}px)" srcset={img?.url} type="image/jpeg" />
								<source
									media={`(min-width:${img?.width + 1}px) and (max-width:${
										header?.foregroundThumbnails[i + 1].width
									}px)`}
									srcset={img?.url}
									type="image/jpeg"
								/>
							{:else if i == header?.foregroundThumbnails.length - 1}
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
							class="outlined"
							on:click={() =>
								list.initAutoMixSession({
									config: { playerParams: header.buttons.radio?.params },
									playlistId: header.buttons.radio?.playlistId,
								})}><Icon size="1.25em" name="radio" /><span class="button-text"> Play Radio</span></button
						>
					{/if}
					{#if header?.buttons.shuffle !== false}
						<button
							on:click={() =>
								list.initAutoMixSession({
									videoId: header.buttons.shuffle?.videoId,
									config: { playerParams: header.buttons.shuffle?.params },
									playlistId: header.buttons.shuffle?.playlistId,
								})}><Icon size="1.25em" name="shuffle" /><span class="button-text"> Shuffle</span></button
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
		top: 0%;

		right: 0;
		left: 0%;
		bottom: 0;
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
		top: 0%;

		right: 0;
		left: 0%;
		bottom: 0;
		width: 100%;
		height: 100%;
		z-index: 5;
		&::before {
			background: rgba(0, 0, 0, 0.438);
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

		@media only screen and (min-width: 640px) {
		}
	}
	.artist-thumbnail {
		display: block;
		position: relative;
		height: 100%;

		padding-top: 16vh;
		overflow: hidden;
		transition: background-color 0.8s cubic-bezier(0.19, 0, 0.7, 1);
		background-color: rgba(0, 0, 0, 0.1);

		@media only screen and (min-width: 1080px) and (max-width: 1600px) {
			padding-top: 18rem;
		}
		@media only screen and (min-width: 1601px) {
			padding-top: 33vh;
		}

		&::before {
			position: absolute;
			content: "";
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}
	}

	.gradient {
		z-index: 0;
		width: 100%;
		height: inherit;
		position: absolute;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		&::before {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			z-index: -5;
			content: "";
		}

		top: 0;
	}
	.header-thumbnail {
		z-index: -1;
		top: 0;

		width: 100%;
		height: 100%;

		max-height: 100%;
		-o-object-fit: cover;
		object-fit: cover;
		position: absolute;
		transition: opacity 0.75s linear;

		overflow: hidden;

		border-radius: 0;
		-o-object-position: top;
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
			flex-wrap: wrap;
			flex-direction: column;
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
				font-family: "CommissionerVariable", sans-serif;

				text-shadow: rgba(0, 0, 0, 0.171) 0.2rem -0.12rem 0.5rem;

				letter-spacing: -0.02em;
				padding-bottom: 1rem;

				@media (min-width: 320px) and (max-width: 499px) {
				}
				@media (min-width: 500px) and (max-width: 640px) {
				}
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
