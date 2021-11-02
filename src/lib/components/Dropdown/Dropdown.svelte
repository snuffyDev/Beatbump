<script lang="ts">
	import Icon from '$components/Icon/Icon.svelte'
	import { clickOutside } from '$lib/js/clickOutside'
	import { createEventDispatcher, setContext } from 'svelte'
	import { quartInOut } from 'svelte/easing'
	import { slide } from 'svelte/transition'
	import DropdownItem from './DropdownItem.svelte'

	export let isHidden = false
	export let type = ''
	export let items = []
	export let color = 'white'
	let showing = false
	$: menuToggle = showing ? true : false
	const dispatch = createEventDispatcher()
	const hideEvent = () => dispatch('close')
	const openEvent = () => dispatch('open')
	setContext('menu', { update: isHidden })
</script>

<div
	class="menu"
	on:focusout={() => {
		isHidden = false
	}}
	use:clickOutside
	on:click_outside={() => {
		isHidden = false
	}}
>
	{#if isHidden}
		<div
			on:mouseleave|stopPropagation={() => {
				isHidden = false
			}}
			transition:slide={{ duration: 125, easing: quartInOut }}
			class={type == 'player' ? 'dd-player' : 'dd-menu'}
		>
			{#each items as item}
				<DropdownItem
					on:click={item.action}
					on:click={() => (isHidden = false)}
					text={item.text}
					icon={item.icon}
				/>
			{/each}
		</div>
	{/if}
	<div
		class="dd-button"
		on:click|stopPropagation={() => {
			isHidden = !isHidden
			// console.log(isHidden)
		}}
	>
		<svelte:component this={Icon} {color} size="1.5em" name="dots" />
	</div>
</div>

<style lang="scss">
	.menu {
		display: contents;
	}
	.dd-button {
		stroke: rgba(0, 0, 0, 0.692);
		margin: 0pt;
		position: unset;
		// z-index: 5;
		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
