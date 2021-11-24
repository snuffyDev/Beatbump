<script lang="ts">
	import Icon from '$components/Icon/Icon.svelte'
	import { clickOutside } from '$lib/js/clickOutside'
	import { quartOut } from 'svelte/easing'
	import { slide } from 'svelte/transition'

	import { PopperStore } from '../Popper'
	import DropdownItem from './DropdownItem.svelte'

	export let color = 'white'

	$: items = $PopperStore.items
	$: type = $PopperStore.type

	$: isHidden = $PopperStore.items.length !== 0

	function onClose() {
		PopperStore.set({
			items: [],
			isOpen: false,
			type,
			x: undefined,
			y: undefined,
			bottom: undefined
		})
	}
	let width
	let viewport_height
	let viewport_width
	let popperHeight
	let popper: HTMLElement = undefined
	$: rect = popper && popper.getBoundingClientRect()
	$: posY =
		$PopperStore.y - popperHeight <= 0
			? $PopperStore.y
			: $PopperStore.bottom + popperHeight >= viewport_height
			? $PopperStore.y - popperHeight
			: $PopperStore.y

	$: posX =
		$PopperStore.direction === 'right'
			? popper && rect?.left <= 0
				? $PopperStore.x + rect?.width
				: rect?.right >= viewport_width
				? viewport_width + -width * 1.75
				: $PopperStore.x
			: $PopperStore.x - width
	$: isHidden &&
		popper &&
		(() => {
			console.log('hasfocus')
			popper.focus()
		})()
	// $: console.log(items, posY)
</script>

<svelte:window
	bind:innerHeight={viewport_height}
	bind:innerWidth={viewport_width}
/>

{#if isHidden}
	<!-- on:focusout={onClose} -->
	<div
		use:clickOutside
		on:click_outside={onClose}
		bind:clientWidth={width}
		bind:clientHeight={popperHeight}
		style="transform: translate({posX}px, {posY}px)"
		on:mouseleave|stopPropagation={onClose}
		bind:this={popper}
		transition:slide={{ duration: 125, easing: quartOut }}
		class={type == 'player' ? 'dd-player' : 'dd-menu'}
	>
		{#each items as item}
			<DropdownItem
				on:click={item.action}
				on:click={onClose}
				text={item.text}
				icon={item.icon}
			/>
		{/each}
	</div>
{/if}

<style lang="scss">
	.menu {
		display: contents;
	}
	.dd-button {
		stroke: rgba(0, 0, 0, 0.692);
		margin: 0pt;
		position: unset;
		// z-index: 5;
		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
