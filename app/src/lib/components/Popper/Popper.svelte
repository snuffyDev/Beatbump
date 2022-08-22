<script lang="ts">
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
	let width;
	$: popper = width < 640 ? poppers[0] : poppers[1];
</script>

<svelte:window bind:innerWidth={width} />

<svelte:component this={popper.component} {main} />
