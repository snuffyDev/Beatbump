<svelte:options namespace="svg" />

<script context="module">
	import icons from "./icons.svg";
</script>

<script lang="ts">
	import type { Icons } from "./icons";
	export let name: Icons;
	export let size = "1.5em";
	export let strokeWidth: number | "default" = "default";
	export let color = "var(--stroke, currentColor)";
	export let fill = "none";
	export let style = "";
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	{fill}
	stroke-linecap="round"
	stroke={color}
	stroke-linejoin="round"
	style="width: {size}; height:{size}; transition: stroke linear 50ms; stroke-width: {name ===
	'dots'
		? 2
		: fill !== 'none' && strokeWidth === 'default'
		? 0
		: strokeWidth === 'default'
		? 1
		: strokeWidth}; {style}; {strokeWidth ?? `--stroke-width: ${strokeWidth}`}"
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
	@media screen and (min-width: 640px) {
		svg {
			stroke-width: var(--stroke-width, initial);
		}
	}
</style>
