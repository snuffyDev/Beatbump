<script lang="ts">
	import Icon from '$components/Icon/Icon.svelte'
	import { clickOutside } from '$lib/js/clickOutside'
	import { createEventDispatcher, setContext } from 'svelte'
	import { quartInOut } from 'svelte/easing'
	import { slide } from 'svelte/transition'
	import { PopperStore } from '../Popper'
	import DropdownItem from './DropdownItem.svelte'

	export let color = 'white'

	$: items = $PopperStore.items
	$: type = $PopperStore.type

	$: isHidden = $PopperStore.items.length !== 0
	const dispatch = createEventDispatcher()

	const hideEvent = () => dispatch('close')
	const openEvent = () => dispatch('open')
	setContext('menu', { update: isHidden })
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
	let popperHeight
	$: posY =
		popperHeight &&
		($PopperStore.y - popperHeight <= 0
			? $PopperStore.y
			: $PopperStore.bottom + popperHeight >= viewport_height
			? $PopperStore.y - popperHeight
			: $PopperStore.y)
	// $: console.log(items)
</script>

<svelte:window bind:innerHeight={viewport_height} />
<div
	class="menu"
	on:focusout={onClose}
	use:clickOutside
	on:click_outside={onClose}
>
	{#if isHidden}
		<div
			bind:clientWidth={width}
			bind:clientHeight={popperHeight}
			style="transform: translate({$PopperStore.x - width}px, {posY}px)"
			on:mouseleave|stopPropagation={onClose}
			transition:slide={{ duration: 125, easing: quartInOut }}
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
</div>

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
