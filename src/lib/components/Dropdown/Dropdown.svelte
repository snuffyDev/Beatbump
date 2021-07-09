<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import Icon from '$lib/components/Icon/Icon.svelte'

	import { clickOutside } from '$lib/js/clickOutside'
	import { quartInOut, quintIn } from 'svelte/easing'
	export let type = ''

	let showing = false
	$: menuToggle = showing ? true : false
	const dispatch = createEventDispatcher()
</script>

<div
	class="menuButtons"
	on:click={() => {
		showing = !showing
		console.log(showing)
	}}
	use:clickOutside
	on:click_outside={() => {
		showing = false
	}}>
	<svelte:component this={Icon} size="1.5em" name="dots" />
	{#if menuToggle}
		<div
			transition:slide={{ duration: 125, easing: quartInOut }}
			class={type == 'player' ? 'dd-player' : 'dd-menu'}>
			<slot name="content" />
			<!-- <div class="dd-item">
				<slot name="item" itemprop="item" />
			</div> -->
		</div>
	{/if}
</div>

<style lang="scss">
	.menuButtons {
		z-index: 1;
		margin-right: 0.2rem;
		stroke: 2px rgba(0, 0, 0, 0.692);
		height: 2%;
		margin: 0pt;
		/* position: relative; */
		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
