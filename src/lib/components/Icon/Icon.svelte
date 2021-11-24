<svelte:options namespace="svg" />

<script lang="ts">
	import icons from './icons'
	export let name
	export let size = '1.5rem'
	export let color = 'currentColor'
	export let lclass = ''
	export let fill = 'none'
	export let style = ''
	let box = 24
	let displayIcon = icons[name]
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	focusable="false"
	{fill}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	style="width: {size}; height:{size}; stroke: {color} !important; {style}; transition: stroke linear 50ms;"
	viewBox="0 0 {box} {box}">{@html displayIcon}</svg
>

<style>
	svg {
		pointer-events: none;
		display: -ms-inline-flexbox;
		display: -webkit-inline-flex;
		display: inline-flex;
		-ms-flex-align: center;
		-webkit-align-items: center;
		align-items: center;
		-ms-flex-pack: center;
		-webkit-justify-content: center;
		justify-content: center;
		position: relative;
		vertical-align: middle;
	}
</style>
