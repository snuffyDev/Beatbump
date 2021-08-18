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
			on:mouseleave={() => {
				isHidden = false
			}}
			transition:slide={{ duration: 125, easing: quartInOut }}
			class={type == 'player' ? 'dd-player' : 'dd-menu'}
		>
			{#each items as item}
				<DropdownItem
					on:click={item.action}
					text={item.text}
					icon={item.icon}
				/>
			{/each}
		</div>
	{/if}
	<div
		class="menuButtons"
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
		position: relative;
		display: flex;
		flex-direction: column;
	}
	.menuButtons {
		margin-right: 0.2rem;
		stroke: rgba(0, 0, 0, 0.692);

		height: 2%;
		margin: 0pt;
		position: relative;
		flex-direction: column;
		display: flex;

		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
