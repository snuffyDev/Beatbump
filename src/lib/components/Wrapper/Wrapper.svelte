<script lang="ts">
	import { navigating, page } from '$app/stores'
	import { fade, fly } from 'svelte/transition'
	import { expoInOut } from 'svelte/easing'
	export let main
	export let key
	// console.log($page.path, $page.query, $navigating)
	$: nav = $navigating ? true : false
	let isNavigating
	$: if (nav == true) isNavigating = !isNavigating
	$: if (key) {
		if (main) main.scrollTo({ top: 0, behavior: 'smooth' })
	}
	// $: console.log(isNavigating)
</script>

{#key key}
	<div
		in:fly={{ x: -10, duration: 500, delay: 300, easing: expoInOut }}
		out:fly={{ x: 5, duration: 500, easing: expoInOut }}>
		<slot />
	</div>
{/key}

<style>
	div {
		display: block;
		height: 100%;
	}
</style>
