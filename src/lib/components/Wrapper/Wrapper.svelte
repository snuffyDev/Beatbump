<script lang="ts">
	import { navigating } from '$app/stores'

	import { afterUpdate, beforeUpdate } from 'svelte'

	import { quintInOut } from 'svelte/easing'

	import { fade } from 'svelte/transition'

	export let main
	$: if ($navigating !== null) {
		main.scrollTo({ top: 0, behavior: 'smooth' })
		// console.log('null')
	}
</script>

<slot />
