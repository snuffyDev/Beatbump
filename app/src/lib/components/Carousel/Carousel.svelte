<script lang="ts">
	import type { CarouselHeader } from "$lib/types";
	import type { CarouselItem as Item } from "$lib/types";

	import CarouselItem from "./CarouselItem.svelte";
	import Icon from "$components/Icon/Icon.svelte";
	import { page } from "$app/stores";
	import { onDestroy, onMount } from "svelte";
	import observer from "./observer";
	import { browser } from "$app/env";

	export let header: CarouselHeader;
	export let items: Item[] = [];
	export let type = "";
	export let kind = "normal";
	export let isBrowseEndpoint;
	export let visitorData = "";

	let moreOnLeft, moreOnRight;

	let clientWidth;
	let carousel: HTMLDivElement = undefined;

	let frame;
	let hasScrollWidth = false;
	const scrollPositions = {
		left: 0,
		width: -1,
		right: 0,
	};
	function scrollHandler() {
		if (!hasScrollWidth && scrollPositions.width < 0) {
			hasScrollWidth = true;
			scrollPositions.width = carousel.scrollWidth;
		}
		const scrollLeft = carousel.scrollLeft;

		moreOnLeft = scrollLeft < 15 ? false : true;
		scrollPositions.left = scrollLeft;

		moreOnRight = scrollPositions.left < scrollPositions.width - clientWidth - 15 ? true : false;
		scrollPositions.right = scrollPositions.width - scrollLeft - 15;
	}
	function onScroll(event) {
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(scrollHandler);
	}
	onMount(() => {
		if (carousel) {
			scrollHandler();
		}
	});
	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(frame);
			carousel = null;
			frame = null;
		}
	});
	const isArtistPage = $page.url.pathname.includes("/artist/");
	const urls = {
		playlist: `/playlist/${header?.browseId}`,
		trending: `/trending/new/${header?.browseId}${header?.params ? `?params=${header.params}` : ""}${
			header?.itct ? `&itct=${encodeURIComponent(header?.itct)}` : ""
		}`,
		artist: `/artist/releases?browseId=${header?.browseId}&visitorData=${visitorData}&params=${header?.params}&itct=${header?.itct}`,
	};
	let href =
		header?.browseId && isArtistPage ? urls.artist : header.browseId?.includes("VLP") ? urls.playlist : urls.trending;
</script>

<div class="header resp-content-width">
	{#if header?.subheading}
		<p class="subheading">{header?.subheading}</p>
	{/if}
	<span class="h2">
		{header.title}
	</span>
	{#if !header.title.includes("Videos") && header.browseId}
		<a style="white-space:pre; display: inline-block;" {href}>
			<small>See All</small>
		</a>
	{:else if isArtistPage && header.title.includes("Videos")}
		<a style="white-space:pre; display: inline-block;" href={`/playlist/${header?.browseId}`}>
			<small>See All</small>
		</a>
	{/if}
</div>
<div class="section">
	<div
		class="left"
		class:showMoreBtn={!moreOnLeft}
		on:click={() => {
			if (!items || scrollPositions.left <= 25) return;
			carousel.scrollLeft -= Math.ceil((scrollPositions.width / items.length) * 2);
		}}
	>
		<Icon name="chevron-left" size="1.5em" />
	</div>

	<div
		class="right"
		class:showMoreBtn={!moreOnRight}
		on:click={() => {
			if (!items || scrollPositions.right <= 25) return;
			carousel.scrollLeft += Math.ceil((scrollPositions.width / items.length) * 2);
		}}
	>
		<Icon name="chevron-right" size="1.5em" />
	</div>

	<div class="scroll" id="scrollItem" on:scroll={onScroll} bind:clientWidth bind:this={carousel} use:observer>
		{#each items as item, index}
			{#if type == "trending"}
				<CarouselItem type="trending" {kind} aspectRatio={item.aspectRatio} {item} {isBrowseEndpoint} {index} />
			{:else if type == "artist" || type == "home"}
				<CarouselItem {type} {kind} aspectRatio={item.aspectRatio} {isBrowseEndpoint} {item} {index} />
			{:else if type == "new"}
				<CarouselItem type="new" aspectRatio={item.aspectRatio} {item} {index} />
			{/if}
		{/each}
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_carousel";
	// .header {
	// 	margin-top: 0.125em;
	// }
	.subheading {
		// margin-bottom: 0;
		color: rgb(175, 175, 175);
		font-weight: 500;
	}
	.c-group {
		display: flex;
		// grid-auto-columns: 1fr;

		// grid-auto-flow: column;
		scroll-snap-align: start;
		align-items: flex-start;
		// visibility: hidden;
		position: relative;
		&::before {
			display: block;
			content: "";
			position: absolute;

			padding-top: calc(100% * 2 / 3);
		}
	}
	.left,
	.right {
		position: absolute;
		top: 40%;
		z-index: 1;
		bottom: 0;
		pointer-events: all;
		cursor: pointer;
		will-change: opacity, visibility;
		background-color: hsl(0deg 0% 88% / 95%);
		border: rgba(0, 0, 0, 0.171) 0.33px solid;
		transition: background-color 200ms cubic-bezier(0.22, 0.61, 0.36, 1);
		box-shadow: 0 0 8px -4px hsl(0deg 0% 0% / 20%);
		height: 3rem;
		color: hsla(0, 0%, 18%, 1);
		border-radius: 50%;
		opacity: 1;
		padding: 0;
		width: 3rem;
		display: inline-flex !important;
		align-items: center;
		justify-content: center;

		contain: strict;
		&:hover {
			background-color: rgb(233, 233, 233);
			box-shadow: -1px -1px 8px -12px hsl(0deg 0% 0% / 20%) inset, 1px 1px 10px -6px hsl(0deg 0% 0% / 10%) inset;
			color: #111111e0;
		}
		&:active {
			background-color: rgb(223, 223, 223);
			box-shadow: 0 0 12px -9px hsl(0deg 0% 7% / 88%) inset, inset -2px -2px 5px -9px hsl(0deg 0% 8% / 92%);
		}
		@media screen and (max-width: 640px) {
			display: none !important;
			visibility: hidden;
		}
	}
	.left {
		left: -1.5em;
	}
	.right {
		right: -1.5em;
	}
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		margin-bottom: 2.88em;

		border-radius: var(--sm-radius);

		contain: layout style;
		@media screen and (min-width: 720px) {
			margin-bottom: 2.3339em;
		}
	}
	.showMoreBtn {
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
	}
	.scroll {
		// background: hsla(255, 21%, 30%, 0);
		contain: layout paint style;
		height: auto;
		// display: flex;
		// flex-direction: row;
		display: grid;
		grid-auto-flow: dense column;
		grid-auto-columns: min-content;
		overflow-x: scroll;
		overflow-y: visible;
		width: auto;
		-ms-scroll-snap-type: x mandatory;
		scroll-snap-type: x mandatory;
		border-radius: inherit;
		overflow-anchor: none;
		-webkit-overflow-scrolling: touch;
		scrollbar-gutter: 0.833333rem;
		scrollbar-width: thin;

		contain: layout style paint;
		touch-action: pan-x pan-y;
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
		&:last-child {
			padding-right: 0.5rem;
		}
		&:first-child {
			// padding-left: 0.5rem;
			visibility: visible;
		}
	}
</style>
