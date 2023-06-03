<svelte:options namespace="svg" />

<script context="module">
	import icons from "./icons.svg";
</script>

<script lang="ts">
	import type { Icons } from "./icons";
	export let name: Icons;
	export let size = "1.5rem";
	export let color = "var(--stroke, currentColor)";
	export let fill = "none";
	export let style = "";
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	{fill}
	stroke-width={fill !== "none" ? 0 : 2}
	stroke-linecap="round"
	stroke={color}
	stroke-linejoin="round"
	style="width: {size}; height:{size}; {style}; transition: stroke linear 50ms;"
	viewBox="0 0 24 24"><use href="{icons}#{name}" /></svg
>

<style>
	svg {
		pointer-events: none;
		display: inline-flexbox;
		display: inline-flex;
		display: inline-flex;
		-ms-flex-align: center;
		align-items: center;
		-ms-flex-pack: center;
		justify-content: center;
		position: relative;
		stroke: var(--stroke, currentColor);
		vertical-align: middle;
		shape-rendering: geometricprecision;
	}
</style>
