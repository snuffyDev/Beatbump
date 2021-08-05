<script>
	import { api } from '$lib/api'
	import { onMount } from 'svelte'
	const params = { browseId: 'UCCF_6PwrZf1u70yghKms3Mw' }
	onMount(async () => {
		const data = await api('artist', params)
		console.log(await data)
	})
</script>

<h1>Nice</h1>
