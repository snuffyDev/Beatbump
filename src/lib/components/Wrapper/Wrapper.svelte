<script lang="ts">
	import { navigating } from '$app/stores'
	import { fly } from 'svelte/transition'
	import { quadInOut } from 'svelte/easing'
	import { tick } from 'svelte'
	export let main
	export let key
	$: isNavigating = $navigating
	$: console.log(isNavigating)
	$: if (key) catchUp()
	async function catchUp() {
		// console.log(key)
		await tick()
		if (main) main.scrollTo({ top: 0, behavior: 'smooth' })
	}

	// $navigating
</script>

{#key key}
	<div
		in:fly={{ x: -15, duration: 400, delay: 400, easing: quadInOut }}
		out:fly={{ x: -5, duration: 400, easing: quadInOut }}>
		<slot />
	</div>
{/key}

<style>
	div {
		display: block;
		height: 100%;
	}
</style>
