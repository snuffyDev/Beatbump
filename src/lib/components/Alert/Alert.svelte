<script lang="ts">
	import { alertHandler } from '$lib/stores/stores'

	export let color = 'red'
	export let message

	import { fly } from 'svelte/transition'
</script>

<div class="alert-container">
	{#if $alertHandler.msg}
		<div
			transition:fly={{ y: 200, duration: 750 }}
			on:introend={() => {
				setTimeout(() => {
					alertHandler.set({ msg: undefined, action: undefined })
				}, 2500)
			}}
			class="alert m-alert-error">
			{message}
		</div>
	{/if}
</div>

<style lang="scss">
	.alert-container {
		display: flex;
		position: fixed;
		bottom: 5rem;
		left: 0;
		right: 0;
		justify-content: center;
	}
	.m-alert-danger {
	}
</style>
