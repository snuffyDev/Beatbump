<script lang="ts">
	import { queryParams } from '$lib/utils'

	let text
	const req = async () => {
		let body = {
			path: 'playlist',
			endpoint: 'browse',
			type: 'playlist',
			browseId: 'VLRDCLAK5uy_kfYirvQ6KXjHJBgPBl5kAqoWrg4VMMkiY'
		}
		let newbody = Object.entries(body)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
			)
			.join('&')
		if (newbody) {
			const res = await fetch('/api/api.json', {
				method: 'POST',
				body: newbody,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
			const data = await res.json()
			text = await JSON.stringify(data)
			console.log(text)
		}
	}
</script>

{text}
<button on:click|preventDefault={req}>Click me</button>

<style lang="scss">
</style>
