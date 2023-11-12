<svelte:options immutable={true} />

<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import Icon from "$components/Icon/Icon.svelte";
	import type { CarouselHeader } from "$lib/types";
	import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
	import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
	import { onDestroy, onMount } from "svelte";
	import CarouselItem from "./CarouselItem.svelte";
	import observer from "./observer";

	export let header: CarouselHeader;
	export let items: (IListItemRenderer | ICarouselTwoRowItem)[] = [];
	export let type = "";
	export let kind = "normal";
	export let isBrowseEndpoint: boolean;
	export let visitorData = "";
	export let nofollow = false;

	let moreOnLeft: boolean, moreOnRight: boolean;

	let clientWidth: number;
	let carousel: HTMLDivElement = undefined;

	let frame: number;
	let startTime: number;

	let hasScrollWidth = false;
	let isScrolling = false;

	const scrollPositions = {
		left: 0,
		width: -1,
		right: 0,
	};
	function scrollHandler(ts: number, context?: (any & "left") | "right") {
		if (!carousel) return;
		if (startTime === undefined) {
			startTime = ts;
		}
		const elapsed = ts - startTime;

		if (elapsed >= 32) {
			if (!hasScrollWidth && scrollPositions.width < 0) {
				hasScrollWidth = true;
				scrollPositions.width = carousel.scrollWidth;
			}

			const scrollLeft = carousel.scrollLeft;

			moreOnLeft = scrollLeft < 15 ? false : true;
			scrollPositions.left = scrollLeft;

			moreOnRight =
				scrollPositions.left < scrollPositions.width - clientWidth - 15
					? true
					: false;
			scrollPositions.right = scrollPositions.width - scrollLeft - 15;

			if (context === "left") {
				carousel.scrollLeft -= Math.ceil(
					(scrollPositions.width / items.length) * 2,
				);
			} else if (context === "right") {
				carousel.scrollLeft += Math.ceil(
					(scrollPositions.width / items.length) * 2,
				);
			}
			if (frame) cancelAnimationFrame(frame);
			frame = undefined;
			startTime = undefined;
			isScrolling = false;
			return;
		} else {
			frame = requestAnimationFrame((ts) => scrollHandler(ts, context));
		}
	}

	function onScroll(context?: any | "left" | "right") {
		if (frame) {
			return;
		}
		if (!carousel) return;
		if (!clientWidth) clientWidth = carousel.clientWidth;
		if (isScrolling) {
			cancelAnimationFrame(frame);
		} else {
			isScrolling = true;
		}

		requestAnimationFrame((ts) => scrollHandler(ts, context));
	}

	onMount(() => {
		if (carousel) {
			onScroll();
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
		trending: `/trending/new/${header?.browseId}${
			header?.params ? `?params=${header.params}` : ""
		}${header?.itct ? `&itct=${encodeURIComponent(header?.itct)}` : ""}`,
		artist: `${header.browseId}/releases?visitorData=${visitorData}&params=${header?.params}&itct=${header?.itct}`,
	};

	let href =
		header?.browseId && isArtistPage
			? urls.artist
			: header.browseId?.includes("VLP")
			? urls.playlist
			: urls.trending;
</script>

<div class="header resp-content-width">
	{#if header?.subheading}
		<p class="subheading">{header?.subheading}</p>
	{/if}
	<span class="h2">
		{header.title}
	</span>
	{#if !header.title.includes("Videos") && header.browseId}
		<a {href}>
			<small>See All</small>
		</a>
	{:else if isArtistPage && header.title.includes("Videos")}
		<a href={urls.playlist}>
			<small>See All</small>
		</a>
	{/if}
</div>
<div class="section">
	<button
		class="left"
		class:showMoreBtn={!moreOnLeft}
		on:click={() => {
			if (!items || scrollPositions.left <= 25) return;
			onScroll("left");
		}}
	>
		<Icon
			name="chevron-left"
			size="1.5em"
		/>
	</button>

	<button
		class="right"
		class:showMoreBtn={!moreOnRight}
		on:click={() => {
			if (!items || scrollPositions.right <= 25) return;
			onScroll("right");
		}}
	>
		<Icon
			name="chevron-right"
			size="1.5em"
		/>
	</button>

	<div
		class="scroll"
		id="scrollItem"
		on:scroll={onScroll}
		bind:this={carousel}
		use:observer={{ items }}
	>
		{#each items as item, index}
			{#if type === "trending"}
				<CarouselItem
					type="trending"
					{kind}
					aspectRatio={item.aspectRatio}
					{item}
					isBrowseEndpoint={!!item.endpoint}
					{nofollow}
					{index}
				/>
			{:else if type === "artist" || type === "home"}
				<CarouselItem
					{type}
					{kind}
					aspectRatio={item.aspectRatio}
					{nofollow}
					isBrowseEndpoint={!!item.endpoint}
					{item}
					{index}
				/>
			{:else if type === "new"}
				<CarouselItem
					type="new"
					aspectRatio={item.aspectRatio}
					{nofollow}
					{item}
					{index}
				/>
			{/if}
		{/each}
	</div>
</div>

<style
	lang="scss"
	src="./index.scss"
></style>
