<script lang="ts">
	import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'

	import Icon from '$lib/components/Icon/Icon.svelte'

	import { clickOutside } from '$lib/js/clickOutside'
	export let type = ''
	export let show = false
</script>

<div
	class="menuButtons"
	on:click={() => {
		show = !show
	}}>
	<svelte:component this={Icon} size="1.5em" name="dots" />
	{#if show}
		<div
			transition:slide={{ duration: 125 }}
			class={type == 'player' ? 'dd-player' : 'dd-menu'}
			use:clickOutside
			on:click_outside={() => {
				show = !show
			}}>
			<slot name="content" />
			<!-- <div class="dd-item">
				<slot name="item" itemprop="item" />
			</div> -->
		</div>
	{/if}
</div>

<style lang="scss">
	.menuButtons {
		z-index: 1;
		margin-right: 0.2rem;
		stroke: 2px rgba(0, 0, 0, 0.692);
		height: 2%;
		margin: 0pt;
		/* position: relative; */
		margin-left: auto;
		/* place-items: flex-end; */
		cursor: pointer;
	}
</style>
