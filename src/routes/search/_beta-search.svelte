<script context="module">
	export async function load({ page, fetch, session, context }) {
		const url = `/api/testing.json?name=et`
		const res = await fetch(url)

		if (res.ok) {
			return {
				props: { name: await res.json() }
			}
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		}
	}
</script>

<script>
	export let name
	console.log(name)
</script>

{name.name}
