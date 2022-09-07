<script lang="ts">
	import { groupSession } from "$lib/stores";
	import Header from "$lib/components/Layouts/Header.svelte";
	import Button from "$lib/components/Button";
	import { sanitize } from "$lib/utils";
	import type { PageData } from "./$types";

	export let data: PageData;

	const { hostId, hostDisplayName, url } = data;

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
