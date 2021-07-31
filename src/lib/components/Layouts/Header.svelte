<script>
	import { page } from '$app/stores'
	import { currentTitle } from '$lib/stores/stores'
	console.log($page.params)
	export let slug
	$: slug = slug
	$: console.log(slug)
</script>

<svelte:head>
	<title>{slug} - Beatbump</title>
</svelte:head>
