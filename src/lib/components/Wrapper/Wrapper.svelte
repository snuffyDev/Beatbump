<script lang="ts">
	import { afterUpdate, beforeUpdate } from 'svelte'

	import { quintInOut } from 'svelte/easing'

	import { fade } from 'svelte/transition'

	export let page

	afterUpdate(() => {
		scrollTo({
			behavior: 'smooth',
			top: 0
		})
	})
</script>

<slot />
