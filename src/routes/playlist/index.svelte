<script lang="ts">
	// import { getPlaylist } from '$lib/utils'
	import { searchTracks } from '$lib/utils'
	// getPlaylist('VLRDCLAK5uy_n4g8XbXdlPTtik7Fwl4RU3Gij-63HBsmo')
	const getData = async () => {
		const response = await searchTracks(
			'weeee',
			'EgWKAQIIAWoKEAMQBBAKEAUQCQ',
			'',
			'',
			''
		)
		const data = await response
		console.log(data)
		return data
	}
	const promise = getData()
</script>

{#await promise}
	<!-- promise is pending -->
	Loading
{:then data}
	<!-- promise was fulfilled -->
	{JSON.stringify(promise)}
{:catch error}
	<!-- promise was rejected -->
{/await}

<style>
</style>
