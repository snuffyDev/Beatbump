<script lang="ts">
	import { fly, fade } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	function keyDownListener(event: KeyboardEvent) {
		if (event.defaultPrevented) {
			return // Do nothing if the event was already processed
		}
		if (event.key == 'Esc' || event.key == 'Escape') {
			event.preventDefault()
			dispatch('close')
		}
	}
</script>

<svelte:window on:keydown={keyDownListener} />
<div
	class="backdrop"
	on:click={() => dispatch('close')}
	transition:fade={{ duration: 125 }}
/>

<div
	class="modal"
	aria-modal="true"
	role="dialog"
	transition:fly={{ duration: 250, delay: 125 }}
>
	<slot name="header" />
	<slot />
</div>

<style src="./index.scss" lang="scss">
</style>
