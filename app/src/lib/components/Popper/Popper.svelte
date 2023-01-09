<script lang="ts">
	import { windowWidth } from "$stores/window";
	import Dropdown from "../Dropdown/Dropdown.svelte";
	import MobilePopper from "./MobilePopper.svelte";
	export let main: HTMLElement;
	const poppers = [
		{
			name: "mobile",
			component: MobilePopper,
		},
		{ name: "desktop", component: Dropdown },
	];
	$: popper = $windowWidth < 640 ? poppers[0] : poppers[1];
</script>

<svelte:component
	this={popper.component}
	{main}
/>
