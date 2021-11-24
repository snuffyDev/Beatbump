<script lang="ts">
	import { fly, fade } from "svelte/transition";
	import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher();
</script>


<div
class="backdrop"
on:click={() => dispatch('close')}
transition:fade={{ duration: 125 }}
/>

<div class="modal" aria-modal="true" role="dialog" 		transition:fly={{ duration: 250, delay: 125 }}>
	<slot name="header" />
	<slot />
</div>

<style src="./index.scss" lang="scss">
</style>
