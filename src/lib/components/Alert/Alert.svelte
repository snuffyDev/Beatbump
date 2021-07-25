<script lang="ts">
	import { errorHandler } from '$lib/stores/stores'

	export let color
	export let message

	import { fly } from 'svelte/transition'
</script>

<div
	transition:fly={{ y: 200, duration: 1000 }}
	on:introend={() => {
		setTimeout(() => {
			errorHandler.set({ msg: undefined, action: undefined })
		}, 1500)
	}}
	class="alert m-alert-danger">
	{message}
</div>

<style lang="scss">
	.m-alert-danger {
		max-width: 29.375rem !important;
	}
</style>
