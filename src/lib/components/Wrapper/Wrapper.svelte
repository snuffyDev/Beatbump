<script lang="ts">
	import { afterUpdate, beforeUpdate } from "svelte";

	import { quintInOut } from "svelte/easing";

	import { fade } from "svelte/transition";

	export let page;

	afterUpdate(() => {
		scrollTo({
			behavior: "smooth",
			top: 0,
		});
	});
</script>

{#key page}
	<div transition:fade={{ duration: 175, easing: quintInOut }}>
		<slot />
	</div>
{/key}
