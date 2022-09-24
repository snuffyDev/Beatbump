<script lang="ts">
	import { browser } from "$app/environment";

	import drag from "$lib/actions/drag";
	import list from "$lib/stores/list";
	import { fade, fly } from "svelte/transition";
	import Icon from "../Icon/Icon.svelte";
	import { isOpen, PopperStore } from "./popperStore";
	$: items = $PopperStore.items;
	$: type = $PopperStore.type;

	let listHeight;
	let sliding;
	let posY = 0;

	function startHandler({ detail }) {
		sliding = true;
		// posY = detail.y
	}

	function release(e) {
		// console.log(e)
		if (sliding) {
			if (posY < listHeight * 0.3) {
				open();
			} else {
				close();
			}
			sliding = false;
		}
	}
	function trackMovement({ y }) {
		if (y <= listHeight && y >= 0) {
			posY = y;
		} else if (y < listHeight * 0.7) {
			trackOpen();
		} else {
			close();
		}
	}
	function trackOpen() {
		posY = posY;
	}
	function open() {
		posY = 0;
	}
	function close() {
		posY = 0;
		PopperStore.reset();
		allowScroll();
		$isOpen = false;
		sliding = false;
	}
	function noScroll() {
		if (!browser) return;
	}
	function allowScroll() {
		if (!browser) return;
		PopperStore.set({ items: [], isOpen: false, type });
	}
	$: items && noScroll();
	let popperClientHeight;
	let popper: Element = undefined;
	$: height = listHeight - popperClientHeight;
	// $: console.log(
	// 	`posY: ${posY}, ${$PopperStore.metadata} height: ${height}; popperHeight: ${popperClientHeight}`
	// )
	// $: console.dir(popper)
</script>

<svelte:window bind:innerHeight={listHeight} />
{#if items.length !== 0}
	<div on:click={allowScroll} in:fade={{ duration: 400 }} out:fade={{ duration: 400 * 2 }} class="backdrop" />
	<div
		class="drag"
		bind:clientHeight={popperClientHeight}
		bind:this={popper}
		in:fly={{ duration: 400, delay: 400, y: listHeight, opacity: 0.1 }}
		out:fly={{ duration: 400 * 2, y: listHeight / 1.2 }}
		style="transform: translateY({posY}px); top:{height ? `${height}px` : `-100%`};  {sliding
			? ''
			: 'transition: transform 300ms cubic-bezier(0.895, 0.03, 0.685, 0.22)'};"
	>
		<div class="popper">
			<div
				class="handle"
				use:drag
				on:dragstart={startHandler}
				on:dragmove={(e) => trackMovement({ y: e.detail.y })}
				on:dragend={release}
			>
				<hr />
			</div>
			{#if type == "player"}
				<section class="m-metadata">
					<div class="image" style="">
						<img
							decoding="async"
							src={$list.mix[$list.position].thumbnails[0].url}
							width={$list.mix[$list.position].thumbnails[0].width}
							height={$list.mix[$list.position].thumbnails[0].height}
							alt=""
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
			{#if type == "search" && $PopperStore.metadata?.artist !== undefined && $PopperStore.metadata.artist.length}
				<section class="m-metadata">
					<div class="image">
						<img src={$PopperStore.metadata.thumbnail} alt="" />
					</div>
					<div class="metatext">
						<span class="title">{$PopperStore.metadata.title}</span>

						{#each $PopperStore.metadata?.artist as artist}
							<span class="artist"> {artist.text ?? ""}</span>
						{/each}
						<span />
						<span class="length">
							{$PopperStore.metadata?.length ?? ""}
						</span>
					</div>
				</section>
			{/if}
			<ul>
				{#each items as item}
					<li on:click={item.action} on:click={allowScroll}>
						<Icon name={item.icon} color="#f2f2f2" size="1.5em" />
						<span class="text">{item.text}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style lang="scss" src="./index.scss">
</style>
