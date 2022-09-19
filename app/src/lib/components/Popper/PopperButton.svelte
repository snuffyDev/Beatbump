<script lang="ts" context="module">
</script>

<script lang="ts">
	import Icon from "../Icon/Icon.svelte";
	import { isOpen } from "./popperStore";

	import { PopperStore } from "./popperStore";
	export let items = [];
	export let type = "";
	export let metadata = {};
	export let size = "1.5em";
	export let tabindex: string | number = "0";
	let nodeIsOpen = false;
	function Popper(node: HTMLElement) {
		let x, y, bottom;
		let timer;
		let initY;
		function handleClick(event: MouseEvent & { target: HTMLElement & EventTarget }) {
			// if (!node.contains(event.target)) {
			// 	PopperStore.reset()
			// 	isOpen = false
			// }
			// console.log(event)
			event.stopImmediatePropagation();
			if ($isOpen) {
				nodeIsOpen = PopperStore.reset();
				$isOpen = false;
				return;
			} else {
				const rect = node.getBoundingClientRect();
				nodeIsOpen = true;
				x = rect.left;
				y = rect.top;
				initY = rect.top;
				bottom = rect.bottom;
				isOpen.set(true);
				PopperStore.set({
					items,
					srcNode: node,
					direction: "normal",
					isOpen: true,
					type,
					x,
					y,
					metadata,
					bottom,
				});
			}
		}
		node.addEventListener("click", handleClick, {
			passive: true,
			capture: true,
		});
		node.addEventListener(
			"keydown",
			(e) => {
				if (e.code !== "Space") return;
				node.click();
			},
			{ capture: true },
		);
		return {
			destroy() {
				if (timer) cancelAnimationFrame(timer);
				node.removeEventListener("click", handleClick);
				node.removeEventListener(
					"keydown",
					(e) => {
						if (e.code !== "Space") return;
						node.click();
					},
					true,
				);
			},
		};
	}
</script>

<div class="dd-button" role="button" aria-label="menu" use:Popper {tabindex}>
	<svelte:component this={Icon} color="#f2f2f2" {size} name="dots" />
</div>

<style src="./index.scss" lang="scss">
</style>
