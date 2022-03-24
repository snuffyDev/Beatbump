<script lang="ts">
	import { elasticOut, expoInOut, expoOut } from 'svelte/easing';

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
	<div in:fade={{ duration: 175, delay: 250 }} out:fade={{ duration: 175 }}>
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
