<script context="module">
	export async function load({ fetch, page }) {
		let browseId = page.query.get('browseId')
		let params = page.query.get('params')
		let itct = page.query.get('itct')
		const response = await fetch(
			`/artist/releases.json?browseId=${encodeURIComponent(
				browseId
			)}&params=${params}&itct=${itct}`
		)
		const data = await response.json()
		return {
			props: {
				data: await data
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	export let data

	$: console.log(data)
</script>

<h1>Test</h1>
{data}
