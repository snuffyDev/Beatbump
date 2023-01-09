<script
	context="module"
	lang="ts"
>
	export function slide(node: Element, { delay = 0, duration = 400, easing = cubicOut } = {}) {
		const style = getComputedStyle(node);
		const opacity = +style.opacity;
		const height = parseFloat(style.height);
		const padding_top = parseFloat(style.paddingTop);
		const padding_bottom = parseFloat(style.paddingBottom);
		const margin_top = parseFloat(style.marginTop);
		const margin_bottom = parseFloat(style.marginBottom);
		const border_top_width = parseFloat(style.borderTopWidth);
		const border_bottom_width = parseFloat(style.borderBottomWidth);

		return {
			delay,
			duration,
			easing,
			css: (t, u) =>
				"overflow: hidden;" +
				`opacity: ${Math.min(t * 20, 1) * opacity};` +
				`height: ${t * height}px;` +
				`padding-top: ${t * padding_top}px;` +
				`padding-bottom: ${t * padding_bottom}px;` +
				`margin-top: ${t * margin_top}px;` +
				`margin-bottom: ${t * margin_bottom}px;` +
				`border-top-width: ${t * border_top_width}px;` +
				`border-bottom-width: ${t * border_bottom_width}px;`,
		};
	}

	// Focus state action
	function focusState(node: HTMLElement) {
		function handleFocusOut(event: FocusEvent & { relatedTarget: HTMLElement & EventTarget }) {
			// console.log(node.contains(event.relatedTarget))
			if (!node.contains(event.relatedTarget)) {
				node.dispatchEvent(new CustomEvent("lostfocus"));
			}
		}

		node.addEventListener("focusout", handleFocusOut, true);
		return {
			destroy() {
				node.removeEventListener("focusout", handleFocusOut, true);
			},
		};
	}
</script>

<script lang="ts">
	import { clickOutside } from "$lib/actions/clickOutside";
	import { windowHeight, windowWidth } from "$stores/window";
	import { cubicOut } from "svelte/easing";

	import { PopperStore, isOpen, activeNode } from "../Popper/popperStore";
	import DropdownItem from "./DropdownItem.svelte";

	export let main: HTMLElement;

	$: items = $PopperStore?.items;
	$: type = $PopperStore?.type;

	$: isShowing = $PopperStore?.items.length !== 0;

	let frame: number;

	let width: number;
	let popperHeight;
	let popper: HTMLElement = undefined;
	let scrollPosY: number = 0;
	let lastScrollTime;
	let isScrolling = false;
	let posX: number;
	let posY: number;

	$: if (popper) {
		let rect = popper.getBoundingClientRect();
		// Get position on the X axis
		if ($PopperStore?.direction === "right") {
			if (rect?.left <= 0) {
				posX = $PopperStore.x + rect?.width;
			} else if (rect?.right >= $windowWidth) {
				posX = $windowWidth + -width * 1.75;
			} else {
				posX = $PopperStore.x;
			}
		} else {
			posX = $PopperStore.x - width;
		}

		// Get position on the Y axis
		if ($PopperStore?.y - popperHeight <= 0) {
			posY = $PopperStore.y;
		} else if ($PopperStore.bottom + popperHeight >= $windowHeight) {
			posY = $PopperStore.y - popperHeight;
		} else {
			posY = $PopperStore.y;
		}
	}

	// Handle close
	function onClose() {
		if ($PopperStore.srcNode !== undefined) {
			activeNode.set(new WeakRef({ value: null }));
			$PopperStore.srcNode.focus();
		}
		$isOpen = false;
		PopperStore.reset();
		isScrolling = false;
	}

	function handleKeyDown(event: KeyboardEvent, fn: () => void) {
		if (event.code === "Space") {
			event.preventDefault();
			fn();
			onClose();
		}
	}
	let startTime: number;
	function scrollHandler(ts: number) {
		if (!popper) return;
		if (startTime === undefined) {
			startTime = ts;
		}
		const elapsed = ts - startTime;

		if (elapsed < 100) {
			frame = requestAnimationFrame(scrollHandler);
		} else {
			onClose();
			cancelAnimationFrame(frame);
			isScrolling = false;
			isShowing = false;
			startTime = undefined;
			scrollPosY = undefined;
			frame = undefined;

			return;
		}
	}

	function onScroll() {
		if (!popper) return;
		if (!scrollPosY) scrollPosY = popper.getBoundingClientRect().top;
		if (frame) {
			return;
		}
		if (isScrolling) return;
		isScrolling = true;

		requestAnimationFrame(scrollHandler);
	}
</script>

<svelte:window on:scroll|capture={onScroll} />

{#if isShowing}
	<div
		use:clickOutside
		use:focusState
		bind:clientWidth={width}
		bind:clientHeight={popperHeight}
		bind:this={popper}
		on:mouseleave|stopPropagation={onClose}
		on:lostfocus={onClose}
		in:slide={{ delay: 125, duration: 125 }}
		out:slide={{ duration: 125 }}
		class={type === "player" ? "dd-player" : "dd-menu"}
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
