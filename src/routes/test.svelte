<script lang="ts" context="module">
	export const ssr = false
</script>

<script lang="ts">
	let name = 'world'
	let src
	function arrayBufferToBlob(buffer, type) {
		return new Blob([buffer], { type: type })
	}
	const imageFetch = async () => {
		try {
			const response = await fetch(
				'https://yt3.ggpht.com/N0qA4HA1NmSoHI7Yh9ijNJwQeLeHm-Xbx2KSapQv5gWer98ps20O1Z4A4yjN9M2aljZ6LATcaQ4=w2560-h1066-p-l90-rj'
			)
			const data = await response.arrayBuffer()
			const blob = arrayBufferToBlob(data, 'image/jpeg')
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			reader.onloadend = function () {
				const base64String = reader.result
				src = base64String
				console.log('Base64 String - ', base64String)
			}
			console.log(src, data)
		} catch (err) {
			console.error(err)
		}
	}
</script>

<h1>Hello {name}!</h1>
<button on:click={imageFetch}>Fetch Image</button>
<img {src} />
