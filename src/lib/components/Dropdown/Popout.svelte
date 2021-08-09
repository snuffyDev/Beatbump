<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte'
	import { slide, fade } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import Icon from '$components/Icon/Icon.svelte'
	import { clickOutside } from '$lib/js/clickOutside'
	import { quartInOut, quintIn } from 'svelte/easing'
	import DropdownItem from './DropdownItem.svelte'
	import PopoutItem from './PopoutItem.svelte'
	export let isHidden = false
	export let type = ''
	export let items = []
	export let color = 'white'
	let showing = false
	$: menuToggle = showing ? true : false
	const dispatch = createEventDispatcher()
	setContext('menu', { update: isHidden })
</script>

{#if isHidden}
	<div
		on:mouseleave|stopPropagation={() => {
			isHidden = false
		}}
		use:clickOutside
		on:click_outside={() => {
			isHidden = false
		}}
		transition:slide={{ duration: 200, easing: quartInOut }}
		class="menu">
		{#each items as item}
			<PopoutItem
				{color}
				on:click={item.action}
				on:click={() => {
					isHidden = !isHidden
				}}
				text={item.text}
				icon={item.icon} />
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
		border-radius: var(--lg-radius);

		background: #414141;
	}
</style>
