<script lang="ts">
	import { browser } from '$app/env'

	import drag from '$lib/actions/drag'
	import list from '$lib/stores/list'
	import { key } from '$lib/stores/stores'
	import { fade, fly } from 'svelte/transition'
	import Icon from '../Icon/Icon.svelte'
	import { PopperStore } from './popperStore'

	$: items = $PopperStore.items
	$: type = $PopperStore.type

	let listHeight
	let sliding
	let posY = 0

	function startHandler({ detail }) {
		sliding = true
	}

	function release(e) {
		// console.log(e)
		if (sliding) {
			if (posY < height * 0.7) {
				open()
			} else {
				close()
			}
		}
		sliding = false
	}
	function trackMovement({ y }) {
		if (y <= listHeight && y >= 0) {
			posY = y
		} else if (y > listHeight) {
			trackOpen()
		}
	}
	function trackOpen() {
		posY = posY
	}
	function open() {
		posY = 0
	}
	function close() {
		posY = 0
		PopperStore.reset()
		allowScroll()
		sliding = false
	}
	function noScroll() {
		if (!browser) return
	}
	function allowScroll() {
		if (!browser) return
		PopperStore.set({ items: [], isOpen: false, type })
	}
	$: items && noScroll()

	let popperHeight
	$: height = listHeight - popperHeight + 0.1
</script>

<svelte:window bind:innerHeight={listHeight} />
{#if items.length !== 0}
	<div
		class="backdrop"
		on:click={allowScroll}
		transition:fade={{ duration: 125 }}
	/>
	<div
		in:fly={{ duration: 125, delay: 125, y: 5 }}
		out:fly={{ duration: 250, delay: 125, y: 5 }}
		class="drag"
		bind:clientHeight={popperHeight}
		style="transform: translateY({posY}px); top:{height}px; {sliding
			? ''
			: 'transition: transform 300ms cubic-bezier(0.895, 0.03, 0.685, 0.22)'}; bottom:0;"
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
			{#if type == 'player'}
				<section class="m-metadata">
					<div class="image">
						<img src={$list.mix[$key].thumbnail} alt="" />
					</div>
					<div class="metatext">
						<span>{$list.mix[$key].title}</span>
						<span class="artist">
							{$list.mix[$key].artist
								? $list.mix[$key].artist
								: $list.mix[$key].artistInfo.artist ||
								  $list.mix[$key].artistInfo.artist[0]}
						</span>
						<span class="length">
							<span class="subheading">Now playing</span>
						</span>
					</div>
				</section>
			{/if}
			{#if type == 'search'}
				<section class="m-metadata">
					<div class="image">
						<img src={$PopperStore.metadata.thumbnail} alt="" />
					</div>
					<div class="metatext">
						<span class="title">{$PopperStore.metadata.title}</span>

						{#each $PopperStore.metadata.artist as artist}
							<span class="artist"> {artist.text ?? ''}</span>
						{/each}
						<span />
						<span class="length">
							{$PopperStore.metadata?.length ?? ''}
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

<style src="./index.scss" lang="scss">
</style>
