<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte'
	import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import Icon from '$components/Icon/Icon.svelte'

	import { clickOutside } from '$lib/js/clickOutside'
	import { quartInOut, quintIn } from 'svelte/easing'
	import DropdownItem from '../Carousel/DropdownItem.svelte'
	export let type = ''
	export let items = []
	let showing = false
	$: menuToggle = showing ? true : false
	const dispatch = createEventDispatcher()
	setContext('menu', { update: menuToggle })
</script>

<div class="menu">
	{#if menuToggle}
		<div
			use:clickOutside
			on:click_outside={() => {
				showing = false
			}}
			transition:slide={{ duration: 125, easing: quartInOut }}
			class={type == 'player' ? 'dd-player' : 'dd-menu'}>
			{#each items as item}
				<DropdownItem
					on:click={item.action}
					text={item.text}
					icon={item.icon} />
			{/each}
		</div>
	{/if}
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
</div>

<style lang="scss">
	.menu {
		position: relative;
		isolation: isolate;
		z-index: 1;
		display: flex;
		flex-direction: column;
	}
	.menuButtons {
		margin-right: 0.2rem;
		stroke: rgba(0, 0, 0, 0.692);
		height: 2%;
		margin: 0pt;
		z-index: -5;
		// box-shadow: 0 0 0.5rem 0.125rem #000;
		position: relative;
		flex-direction: column;
		display: flex;

		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
