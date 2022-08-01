<script lang="ts">
	import Icon from "../Icon/Icon.svelte";

	export let text = "";
	export let icon = "";

	// $: console.log(update)
</script>

<div class="dd-item" tabindex="0" on:click on:keydown>
	<Icon name={icon} size="1.5em" />
	<div class="dd-text">{text}</div>
</div>

<style lang="scss">
	.dd-item {
		z-index: 5;
		&:first-child {
			border-top-left-radius: inherit;
			border-top-right-radius: inherit;
		}
		&:last-of-type {
			border-bottom-left-radius: inherit;
			border-bottom-right-radius: inherit;
		}
	}
</style>
