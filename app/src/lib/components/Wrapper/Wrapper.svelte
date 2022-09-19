<script lang="ts">
	import { fade } from "svelte/transition";
	export let main: HTMLElement;
	export let key;
</script>

{#key key}
	<div class="app-content-p" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
		<slot />
	</div>
{/key}

<style>
	div {
		/* display: block; */
		/* position: relative; */
		/* contain: content; */
		will-change: opacity, visibility;
		inset: 0;
		position: absolute;
		/* isolation: isolate; */
	}
</style>
