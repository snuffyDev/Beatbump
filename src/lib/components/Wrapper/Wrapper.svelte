<script lang="ts">
	import { fade } from 'svelte/transition';
	export let main: HTMLElement;
	export let key;
	$: if (key) catchUp();
	async function catchUp() {
		// await tick()
		if (main) main.scrollTop = 0;
	}

	// $navigating
</script>

{#key key}
	<div in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 250 }}>
		<slot />
	</div>
{/key}

<style>
	div {
		/* display: block; */
		height: 100%;
		position: relative;
	}
</style>
