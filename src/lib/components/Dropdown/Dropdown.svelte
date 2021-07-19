<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte'
	import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import Icon from '$components/Icon/Icon.svelte'

	import { clickOutside } from '$lib/js/clickOutside'
	import { quartInOut, quintIn } from 'svelte/easing'
	export let type = ''

	let showing = false
	$: menuToggle = showing ? true : false
	const dispatch = createEventDispatcher()
	setContext('menu', { update: menuToggle })
</script>

<div
	class="menuButtons"
	on:click|stopPropagation={() => {
		showing = !showing
		console.log(showing)
	}}>
	<svelte:component
		this={Icon}
		color={type == 'player' ? 'white' : 'currentColor'}
		size="1.5em"
		name="dots" />
</div>
{#if menuToggle}
	<div
		use:clickOutside
		on:click_outside={() => {
			showing = false
		}}
		transition:slide={{ duration: 125, easing: quartInOut }}
		class={type == 'player' ? 'dd-player' : 'dd-menu'}>
		<slot name="items" />
		<!-- <div class="dd-item">
				<slot name="item" itemprop="item" />
			</div> -->
	</div>
{/if}

<style lang="scss">
	.menuButtons {
		z-index: 1;
		margin-right: 0.2rem;
		stroke: rgba(0, 0, 0, 0.692);
		height: 2%;
		margin: 0pt;
		// box-shadow: 0 0 0.5rem 0.125rem #000;
		/* position: relative; */

		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
