<script context="module">
	import { api } from '$lib/api'

	export async function load({ page }) {
		const id = page.query.get('id')
		const playlist = page.query.get('list') || undefined
		if (!id) {
			return { redirect: '/trending', status: 301 }
		}
		return {
			props: {
				id,
				playlist
			}
		}
	}
</script>

<script>
	export let id
	export let playlist
	import list from '$lib/stores/list'
	import { onMount } from 'svelte'
	onMount(() => {
		if (id || playlist) {
			list.initList(id, playlist)
		}
	})
</script>
