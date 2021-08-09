<script>
	import { page } from '$app/stores'
	import list from '$lib/stores/list'
	import { currentTitle } from '$lib/stores/stores'
	console.log($page.params)
	export let name

	// $: slug = slug
	$: console.log(name)
</script>

<svelte:head>
	<title
		>{$currentTitle !== undefined || '' ? $currentTitle : name} - Beatbump</title>
	<meta property="og:title" content={name} />
</svelte:head>
