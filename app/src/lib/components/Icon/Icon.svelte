<svelte:options namespace="svg" />

<script context="module">
	import icons from "./icons.svg";
</script>

<script lang="ts">
	import type { Icons } from "./icons";
	export let name: Icons;
	export let size = "1.5rem";
	export let strokeWidth: number | "default" = "default";
	export let color = "var(--stroke, currentColor)";
	export let fill = "none";
	export let style = "";
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	{fill}
	stroke-width={fill !== "none" && strokeWidth === "default"
		? 0
		: strokeWidth === "default"
		? 2
		: strokeWidth}
	stroke-linecap="round"
	stroke={color}
	stroke-linejoin="round"
	style="width: {size}; height:{size}; {style}; transition: stroke linear 50ms;"
	viewBox="0 0 24 24"
	><use href="{icons}#{name}" />
	<slot />
</svg>

<style>
	svg {
		pointer-events: none;
		display: inline-block;
		-ms-flex-align: center;
		align-items: center;
		-ms-flex-pack: center;
		justify-content: center;
		position: relative;
		stroke: var(--stroke, currentColor);
		vertical-align: middle;
		shape-rendering: geometricprecision;
	}
	.icon {
		display: inline-block;
		position: relative;
		vertical-align: middle;
		display: inline-flex;
	}
</style>
