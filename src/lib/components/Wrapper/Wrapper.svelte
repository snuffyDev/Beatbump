<script lang="ts">
	import { fade } from "svelte/transition";

	export let page;
</script>

{#key page}
	<div transition:fade>
		<slot />
	</div>
{/key}

<style lang="scss">
</style>
