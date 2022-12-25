<svelte:options immutable={true} />

<script lang="ts">
	import type { CarouselHeader } from "$lib/types";
	import CarouselItem from "./CarouselItem.svelte";
	import Icon from "$components/Icon/Icon.svelte";
	import { page } from "$app/stores";
	import { onDestroy, onMount } from "svelte";
	import observer from "./observer";
	import { browser } from "$app/environment";
	import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";

	export let header: CarouselHeader;
	export let items: IListItemRenderer[] = [];
	export let type = "";
	export let kind = "normal";
	export let isBrowseEndpoint: boolean;
	export let visitorData = "";

	let moreOnLeft: boolean, moreOnRight: boolean;

	let clientWidth: number;
	let carousel: HTMLDivElement = undefined;

	let frame: number;
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
		queueMicrotask(() => {
			if (frame) cancelAnimationFrame(frame);
			frame = requestAnimationFrame(scrollHandler);
		});
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
		artist: `${header.browseId}/releases?visitorData=${visitorData}&params=${header?.params}&itct=${header?.itct}`,
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
		<a
			style="white-space:pre; display: inline-block;"
			{href}
		>
			<small>See All</small>
		</a>
	{:else if isArtistPage && header.title.includes("Videos")}
		<a
			style="white-space:pre; display: inline-block;"
			href={urls.playlist}
		>
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
		<Icon
			name="chevron-left"
			size="1.5em"
		/>
	</div>

	<div
		class="right"
		class:showMoreBtn={!moreOnRight}
		on:click={() => {
			if (!items || scrollPositions.right <= 25) return;
			carousel.scrollLeft += Math.ceil((scrollPositions.width / items.length) * 2);
		}}
	>
		<Icon
			name="chevron-right"
			size="1.5em"
		/>
	</div>

	<div
		class="scroll"
		id="scrollItem"
		on:scroll={onScroll}
		bind:clientWidth
		bind:this={carousel}
		use:observer
	>
		{#each items as item, index}
			{#if type === "trending"}
				<CarouselItem
					type="trending"
					{kind}
					aspectRatio={item.aspectRatio}
					{item}
					isBrowseEndpoint={"endpoint" in item}
					{index}
				/>
			{:else if type === "artist" || type === "home"}
				<CarouselItem
					{type}
					{kind}
					aspectRatio={item.aspectRatio}
					isBrowseEndpoint={"endpoint" in item}
					{item}
					{index}
				/>
			{:else if type === "new"}
				<CarouselItem
					type="new"
					aspectRatio={item.aspectRatio}
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
