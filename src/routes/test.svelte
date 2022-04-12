<script lang="ts">
	import { buildRequest } from "$api/_api/request";

	import Button from "$lib/components/Button";
</script>

<Button
	on:click={() => {
		const req = buildRequest({
			endpoint: "artist",
			params: { browseId: "UCCn7DeREpok-P8lDnYkyZWA" },
			context: { client: { version: "1.20220404.01.00", name: "WEB_REMIX" } }
		});
		console.log(req);
	}}
	text="Click Me"
/>

<style lang="scss">
</style>
