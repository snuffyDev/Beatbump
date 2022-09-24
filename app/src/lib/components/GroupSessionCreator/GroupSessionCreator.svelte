<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { clickOutside } from "$lib/actions/clickOutside";

	import { showGroupSessionCreator } from "$lib/stores";

	import { groupSession } from "$lib/stores/sessions";

	import { IsoBase64 } from "$lib/utils";
	import { sanitize } from "$lib/utils";
	import { SITE_ORIGIN_URL } from "$stores/url";
	import { tick } from "svelte";
	import { fade } from "svelte/transition";
	import Button from "../Button";
	let step = 0;
	let displayName: string = "";
	let checked: boolean = true;
	let sessionURL: string = "";

	async function handleSubmit() {
		if (!displayName) return;
		displayName = sanitize(displayName);
		groupSession.init(displayName, "host", { forceSync: checked });
		await tick();
		step++;
		sessionURL = `${import.meta.env.DEV ? "localhost:5000" : $SITE_ORIGIN_URL}/session?token=${IsoBase64.toBase64(
			JSON.stringify({
				clientId: groupSession.client.clientId,
				displayName: groupSession.client.displayName,
			}),
		)}`;
	}
</script>

{#if $showGroupSessionCreator}
	<div class="backdrop" transition:fade>
		<div class="groupSessionCreator modal" on:click_outside={() => ($showGroupSessionCreator = false)} use:clickOutside>
			<div class="modal-container">
				{#if step === 0}
					<div class="modal-header">
						<span class="h2">New Group Session</span>
					</div>
					<br />
					<div class="modal-body">
						<form on:submit={handleSubmit}>
							<div class="container">
								<p>Enter your display name:</p>
								<div class="input"><input type="" class="input" bind:value={displayName} /></div>
							</div>
							<div class="container">
								<p class="h4 my-2">Settings</p>
								<div>
									<p style="display:inline-block;">
										Force Sync
										<input type="checkbox" style="vertical-align: middle; margin-left: 1em;" bind:checked />
									</p>
								</div>
								<br />
								<div>
									<Button type="submit" disabled={displayName ? false : true} on:click={handleSubmit}
										>Create Group Session</Button
									>
								</div>
								<br />
							</div>
						</form>
					</div>
				{:else if step === 1}
					<div class="modal-header">
						<span class="h2">Created Group Session!</span>
					</div>
					<div class="modal-body">
						<p>
							Your group session has been created! You can invite anyone to join your session by sending them the link
							found below!
						</p>
						<p />
						<p>Your Session URL:</p>
						<div class="url"><p>{sessionURL}</p></div>
						<div class="container">
							<span
								class="copy link"
								on:click={async (event) => {
									if (!browser) return;
									const target = event.currentTarget;
									await navigator.clipboard.writeText(sessionURL);
									target.innerText = "Copied!";
									setTimeout(() => {
										target.innerText = "Copy";
									}, 1500);
								}}
							>
								Copy
							</span>
						</div>
					</div>
				{/if}
			</div>
			<Button
				class="danger"
				on:click={() => {
					showGroupSessionCreator.set(false);
				}}>Close</Button
			>
		</div>
	</div>
{/if}

<style src="./index.scss" lang="scss">
</style>
