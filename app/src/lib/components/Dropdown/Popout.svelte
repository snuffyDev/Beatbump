<script lang="ts">
	import { createEventDispatcher, setContext } from "svelte";
	import { quartInOut } from "svelte/easing";
	import { slide } from "svelte/transition";
	import PopoutItem from "./PopoutItem.svelte";

	export let isShowing;
	export let type = "";
	export let items = [];
	export let color = "white";
	let showing = false;
	$: menuToggle = showing ? true : false;
	const dispatch = createEventDispatcher();
	setContext("menu", { update: isShowing });
</script>

{#if isShowing}
	<div
		on:mouseleave={() => {
			isShowing = false;
		}}
		on:focusout={() => {
			isShowing = false;
		}}
		transition:slide={{ duration: 200, easing: quartInOut }}
		class="menu"
	>
		{#each items as item}
			<PopoutItem
				{color}
				on:click={() => {
					item.action(item);
					isShowing = false;
				}}
				text={item.text}
				icon={item.icon}
			/>
		{/each}
	</div>
{/if}

<style lang="scss">
	.menu {
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 0.3em;
		left: 6em;
		border-radius: $lg-radius;
		background: #424242;
		border: 1px #5f5f5f solid;
	}
</style>
