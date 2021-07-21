<script context="module">
	export async function load({ page, fetch }) {
		const response = await fetch(`/explore/${page.params.slug}.json`)
		const data = await response.json()
		return {
			props: {
				data
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	export let data
	$: console.log(data)
</script>

<style lang="scss">
</style>
