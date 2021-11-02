<script lang="ts">
	import { getContext } from 'svelte'

	import Icon from '../Icon/Icon.svelte'

	export let text = ''
	export let icon = ''

	let { update } = getContext('menu')
	// $: console.log(update)
</script>

<div class="dd-item" on:click>
	<Icon name={icon} size="1.5em" />
	<div class="dd-text">{text}</div>
</div>

<style lang="scss">
	.dd-item {
		z-index: 5;
	}
</style>
