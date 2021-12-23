<script lang="ts">
	import Icon from '$components/Icon/Icon.svelte'
	import { clickOutside } from '$lib/actions/clickOutside'
	import { cubicOut, quartOut } from 'svelte/easing'
	// import { slide } from 'svelte/transition'

	import { PopperStore } from '../Popper'
	import DropdownItem from './DropdownItem.svelte'

	$: items = $PopperStore.items
	$: type = $PopperStore.type

	$: isHidden = $PopperStore.items.length !== 0

	function onClose() {
		$PopperStore.srcNode.focus()
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
	export function slide(
		node: Element,
		{ delay = 0, duration = 400, easing = cubicOut } = {}
	) {
		const style = getComputedStyle(node)
		const opacity = +style.opacity
		const height = parseFloat(style.height)
		const padding_top = parseFloat(style.paddingTop)
		const padding_bottom = parseFloat(style.paddingBottom)
		const margin_top = parseFloat(style.marginTop)
		const margin_bottom = parseFloat(style.marginBottom)
		const border_top_width = parseFloat(style.borderTopWidth)
		const border_bottom_width = parseFloat(style.borderBottomWidth)

		return {
			delay,
			duration,
			easing,
			css: (t, u) =>
				'overflow: hidden;' +
				`opacity: ${Math.min(t * 20, 1) * opacity};` +
				`height: ${t * height}px;` +
				`padding-top: ${t * padding_top}px;` +
				`padding-bottom: ${t * padding_bottom}px;` +
				`margin-top: ${t * margin_top}px;` +
				`margin-bottom: ${t * margin_bottom}px;` +
				`border-top-width: ${t * border_top_width}px;` +
				`border-bottom-width: ${t * border_bottom_width}px;`
		}
	}
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
	$: if (popper) popper.focus()
	// $: console.log($PopperStore)
	function focusState(node: HTMLElement) {
		function handleFocusOut(
			event: FocusEvent & { relatedTarget: HTMLElement & EventTarget }
		) {
			console.log(node.contains(event.relatedTarget))
			if (!node.contains(event.relatedTarget)) {
				node.dispatchEvent(new CustomEvent('lostfocus'))
			}
		}

		node.addEventListener('focusout', handleFocusOut, { capture: true })
		return {
			destroy() {
				node.removeEventListener('focusout', handleFocusOut, true)
			}
		}
	}
	function handleKeyDown(event: KeyboardEvent, fn: () => void) {
		if (event.code === 'Space') {
			event.preventDefault()
			const target = event.target as HTMLElement
			fn()
			onClose()
		}
	}
</script>

<svelte:window
	bind:innerHeight={viewport_height}
	bind:innerWidth={viewport_width}
/>

{#if isHidden}
	<div
		use:clickOutside
		use:focusState
		bind:clientWidth={width}
		bind:clientHeight={popperHeight}
		bind:this={popper}
		on:mouseleave|stopPropagation={onClose}
		on:lostfocus={onClose}
		on:click_outside={onClose}
		in:slide={{ delay: 125, duration: 125 }}
		out:slide={{ duration: 125 }}
		class={type == 'player' ? 'dd-player' : 'dd-menu'}
		style="transform: translate({posX}px, {posY}px)"
		tabindex="0"
	>
		{#each items as item}
			<DropdownItem
				on:click={item.action}
				on:click={onClose}
				on:keydown={(event) => handleKeyDown(event, item.action)}
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
