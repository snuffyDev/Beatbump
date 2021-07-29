<script lang="ts">
	import { errorHandler } from '$lib/stores/stores'

	export let color
	export let message

	import { fly } from 'svelte/transition'
</script>

{#if $errorHandler.msg}
	<div
		transition:fly={{ y: 200, duration: 750 }}
		on:introend={() => {
			setTimeout(() => {
				errorHandler.set({ msg: undefined, action: undefined })
			}, 2500)
		}}
		class="alert m-alert-danger">
		{message}
	</div>
{/if}

<style lang="scss">
	.m-alert-danger {
		max-width: 29.375rem !important;
	}
</style>
