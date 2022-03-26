<script lang="ts">
	import { alertHandler } from "$lib/stores/stores";

	import { fly } from "svelte/transition";
</script>

<div class="alert-container">
	{#if $alertHandler.msg}
		<div
			transition:fly={{ y: 150, duration: 750 }}
			on:introend={() => {
				setTimeout(() => {
					alertHandler.set({ msg: undefined, action: undefined });
				}, 3000);
			}}
			class={`alert m-alert-${$alertHandler.type}`}
		>
			{$alertHandler.msg}
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
</style>
