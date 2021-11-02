<script lang="ts">
	import Dropdown from '../Dropdown/Dropdown.svelte'

	import MobilePopper from './MobilePopper.svelte'
	export let items = []
	export let type = ''
	export let isHidden
	let width
	$: mobile = width < 640 ? true : false
	$: component = mobile ? MobilePopper : Dropdown
</script>

<svelte:window bind:innerWidth={width} />
{#if mobile}
	<svelte:component this={MobilePopper} {type} bind:items bind:isHidden />
{:else}
	<svelte:component this={Dropdown} {type} bind:items bind:isHidden />
{/if}

<style src="./index.scss" lang="scss">
</style>
