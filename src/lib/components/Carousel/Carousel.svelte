<script lang="ts">
	import type { CarouselHeader } from "$lib/types";

	import CarouselItem from "./CarouselItem.svelte";
	import Icon from "$components/Icon/Icon.svelte";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
import { loop, type Task } from "$lib/utils/loop";
import debounce from "$lib/js/debounce";
import { noop } from "svelte/internal";

	export let header: CarouselHeader;
	export let items = [];
	export let type = "";
	export let kind = "normal";
	export let isBrowseEndpoint;
	export let visitorData = '';
	let arr = [];
	let moreOnLeft, moreOnRight;
	if (items.length > 3) {
		arr = [...splitArray(items, 4)];
	} else {
		arr = [[...items]];
	}

	function splitArray(flatArray, numCols) {
		const newArray = [];
		for (let c = 0; c < numCols; c++) {
			newArray.push([]);
		}
		for (let i = 0; i < flatArray.length; i++) {
			const mod = i % numCols;
			newArray[mod].push(flatArray[i]);
		}
		return newArray;
	}
	let idx = 0;
	let carousel: HTMLDivElement = undefined;

	let group = [];
	let task: Task = undefined;
	let lastScrollPositions = {
		left: 0,
		right: 0,
	}
	let running = false;
	onMount(() => {
		let frame;

		// function start (){
		// 	let startTime = performance.now();
		// 	if (running) task.abort();
		// 	running = true;
		// 	task = loop((now) => {

		// 		return running;
		// 	})
		// }
		// carousel !== undefined && start()
		function scrollHandler() {
			if (!carousel) return;
					const scrollLeft = carousel.scrollLeft;
					const scrollWidth = carousel.scrollWidth;
					if (scrollLeft === lastScrollPositions.left || lastScrollPositions.right === scrollWidth - carousel.clientWidth - 15) {noop()};

					debounce(()=>{
						moreOnLeft = carousel.scrollLeft < 15 ? false : true
						lastScrollPositions.left = scrollLeft;
						 moreOnRight = carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 15
							? true
							: false;
							lastScrollPositions.right = scrollWidth - scrollLeft - 15;
					}, 150)();
			cancelAnimationFrame(frame);
		}
		frame = requestAnimationFrame(scrollHandler);

		carousel !== undefined &&
			carousel.addEventListener(
				"scroll",
				() => {
					frame = requestAnimationFrame(scrollHandler);
				},
				{ passive: true }
			);

		return () => {
			// task.abort();
			// task = null;
			// running = false;
			cancelAnimationFrame(frame);
			carousel.removeEventListener(
				"scroll",
				() => {
					frame = requestAnimationFrame(scrollHandler);
				},
				true
			);
		};
		// let rectValue: any = 0
	});
	// $: if (carousel) carousel.scrollLeft += $tween
	const pageIsArtist = $page.url.pathname.includes("/artist/");

	let notArtistPageURLs = header.browseId?.includes("VLP")
		? `/playlist/${header?.browseId}`
		: `/trending/new/${header?.browseId}${
				header?.params ? `?params=${header?.params}` : ""
		  }${header?.itct ? `&itct=${encodeURIComponent(header?.itct)}` : ""}`;
	let href =
		header?.browseId && pageIsArtist
			? `/artist/releases?browseId=${header?.browseId}&visitorData=${visitorData}&params=${header?.params}&itct=${header?.itct}`
			: notArtistPageURLs;
</script>

<div class="header">
	{#if header?.subheading}
		<p class="subheading">{header?.subheading}</p>
	{/if}
	<span class="h2">
		{header.title}
	</span>
	{#if !header.title.includes("Videos") && header.browseId}<a
			style="white-space:pre; display: inline-block;"
			{href}><small>See All</small></a
		>
	{:else if pageIsArtist && header.title.includes("Videos")}
		<a
			style="white-space:pre; display: inline-block;"
			href={`/playlist/${header?.browseId}`}><small>See All</small></a
		>
	{/if}
</div>
<div class="section">
	<div
		class="left"
		class:showMoreBtn={!moreOnLeft}
		on:click={() => {
			if (!arr || idx == 0) return;
			idx--;
			let child = group[idx].children;
			let rect = child[0].getBoundingClientRect();

			carousel.scrollLeft += rect.left;
		}}
	>
		<Icon name="chevron-left" size="1.5em" />
	</div>

	<div
		class="right"
		class:showMoreBtn={!moreOnRight}
		on:click={() => {
			if (!arr || idx == group.length - 1) return;
			idx++;
			let child = group[idx].children;
			let rect = child[0].getBoundingClientRect();
			carousel.scrollLeft += rect.left;
		}}
	>
		<Icon name="chevron-right" size="1.5em" />
	</div>

	<div class="scroll" id="scrollItem" bind:this={carousel}>
		{#each arr as item, index}
			<div class="c-group" bind:this={group[index]}>
				{#each item as item, i}
					{#if type == "trending"}
						<!-- {JSON.stringify(item[1], title, thumbnail, subtitle)} -->
						<CarouselItem
							type="trending"
							aspectRatio={item.aspectRatio}
							{item}
							{isBrowseEndpoint}
							index={i}
						/>
					{:else if type == "artist" || type == "home"}
						<CarouselItem
							{type}
							{kind}
							aspectRatio={item.aspectRatio}
							{isBrowseEndpoint}
							{item}
							index={i}
						/>
					{:else if type == "new"}
						<!-- content here -->
						<CarouselItem
							type="new"
							aspectRatio={item.aspectRatio}
							{item}
							index={i}
						/>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@import "../../../global/stylesheet/components/_carousel";
	// .header {
	// 	margin-top: 0.125em;
	// }
	.subheading {
		margin-bottom: 0;
		color: rgb(175, 175, 175);
		font-weight: 500;
	}
	.c-group {
		display: flex;
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
		&:last-child {
			padding-right: 0.5rem;
		}
		&:first-child {
			// padding-left: 0.5rem;
			visibility: visible;
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

		background-color: hsl(0deg 0% 91% / 79%);
		// border: rgba(0, 0, 0, 0.171) 0.01px solid;
		transition: linear 75ms background-color;
		height: 3rem;
		box-shadow: 0 0 0.12em 0.1em #11111141;
		color: #111111b0;
		border-radius: 50%;
		opacity: 1;
		padding: 0;
		width: 3rem;
		display: inline-flex !important;
		align-items: center;
		justify-content: center;

		contain: content;
		transition: ease 60ms;
		transition-property: opacity, visibility;
		&:hover {
			background-color: rgb(233, 233, 233);
			color: #111111e0;
		}
		&:active {
			background-color: rgb(223, 223, 223);
			box-shadow: 0 0 0.12em 0.1em #11111141, 0 0 0.1em 0.125em #7a7a7a85 inset;
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

		margin-bottom: 3.3339em;

		border-radius: var(--sm-radius);

		contain: layout style;
	}
	.showMoreBtn {
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
	}
	.scroll {
		background: hsla(255, 21%, 30%, 0.2);
		contain: layout paint style;
		height: auto;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
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
	}
</style>
