<script>
	import { page } from '$app/stores'
	import { currentTitle } from '$lib/stores/stores'

</script>

<svelte:head>
	<title
		>{$currentTitle
			? $currentTitle
			: $page.path.replace(
					$page.path.charAt(1),
					`${$page.path.charAt(1).toUpperCase()}`
			  )} - Beatbump</title>
</svelte:head>
