<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";
	import { IsoBase64 } from "$lib/utils/buffer";

	export const load: Load = async ({ url }) => {
		const decoded_token = IsoBase64.fromBase64(decodeURIComponent(url.searchParams.get("token")));
		/// expected format ...   {id: string, displayName: string}
		try {
			const { clientId: host_id, displayName: host_display_name } = JSON.parse(decoded_token);
			return {
				props: {
					hostId: host_id,
					hostDisplayName: host_display_name,
					url: url.pathname + `?${url.searchParams.toString()}`,
				},
			};
		} catch (error) {
			return {
				status: 500,
				error: new Error(error),
			};
		}
	};
</script>

<script lang="ts">
	import { groupSession } from "$lib/stores";
	import Header from "$lib/components/Layouts/Header.svelte";
	import Button from "$lib/components/Button";
	import { sanitize } from "$lib/utils/strings";
	export let hostId: string;
	export let hostDisplayName: string;
	export let url: string;

	let clientDisplayName: string;
	async function joinSession() {
		clientDisplayName = sanitize(clientDisplayName);
		// Listen for the event *before* initializing the session
		// To avoid a race condition.
		groupSession.once("init", () => {
			groupSession.connect(hostId);
		});

		// Initialize connection
		groupSession.init(clientDisplayName, "guest");
	}
</script>

<Header
	title={`${hostDisplayName}'s Beatbump Group Session`}
	desc={`Join ${hostDisplayName}'s Group Session on Beatbump`}
	{url}
/>
<main>
	<h2>Join {hostDisplayName}'s Group Session</h2>
	<p>Please enter a display name below in order to continue with joining.</p>
	<br />
	<div class="input"><input type="text" placeholder="Display Name" bind:value={clientDisplayName} /></div>
	<br />

	<Button disabled={!clientDisplayName} on:click={joinSession}>Join Session</Button>
</main>

<style lang="css">
</style>
