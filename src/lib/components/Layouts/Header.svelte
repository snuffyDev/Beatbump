<script>
	import tagStore from '$lib/stores/ogtags'
	import { currentTitle } from '$lib/stores/stores'

	export let title
	export let desc = ''
	export let url
	export let image = '/logo.png'
	// $: slug = slug
	// $: console.log(name)
	tagStore.init(title, url, desc, image)
</script>

<svelte:head>
	{#each Object.entries($tagStore) as [property, content]}
		{#if content}
			{#if ['title', 'description', 'image'].includes(property)}
				<meta name={property} {content} />
			{:else}
				<meta {property} {content} />
			{/if}
		{/if}
	{/each}
	<title>{$currentTitle ? $currentTitle : $tagStore.title} - Beatbump</title>
</svelte:head>
