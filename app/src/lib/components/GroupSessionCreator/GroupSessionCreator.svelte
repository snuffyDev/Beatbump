<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { clickOutside } from "$lib/actions/clickOutside";

	import { showGroupSessionCreator } from "$lib/stores";

	import { groupSession } from "$lib/stores/sessions";

	import { IsoBase64, sanitize } from "$lib/utils";
	import { SITE_ORIGIN_URL } from "$stores/url";
	import { tick } from "svelte";
	import { fade } from "svelte/transition";
	import Button from "../Button";
	let step = 0;
	let displayName = "";
	let checked = true;
	let sessionURL = "";

	async function handleSubmit() {
		if (!displayName) return;
		displayName = sanitize(displayName);
		groupSession.init(displayName, "host", { forceSync: checked });
		await tick();
		step++;
		sessionURL = `${
			import.meta.env.DEV ? $page.url.host : $SITE_ORIGIN_URL
		}/session?token=${IsoBase64.toBase64(
			JSON.stringify({
				clientId: groupSession.client.clientId,
				displayName: groupSession.client.displayName,
			}),
		)}`;
	}

	// Svelte action to lock focus for keyboard navigation within a modal when it is open
	const focusLock = (node: HTMLElement) => {
		// Find all focusable children
		const focusableElements = node.querySelectorAll(
			'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select',
		);

		// Convert NodeList to Array
		const focusableChildren = Array.prototype.slice.call(focusableElements);

		const firstFocusableEl = focusableChildren[0]; // get first element to be focused inside modal
		const lastFocusableEl = focusableChildren[focusableChildren.length - 1]; // get last element to be focused inside modal

		function lastFocusableElmCb(e: KeyboardEvent) {
			if (e.key === "Tab" && !e.shiftKey) {
				e.preventDefault();
				firstFocusableEl.focus();
			}
		}

		// redirect last tab to first element inside modal
		lastFocusableEl.addEventListener("keydown", lastFocusableElmCb);

		function firstFocusableElmCb(e: KeyboardEvent) {
			if (e.key === "Tab" && e.shiftKey) {
				e.preventDefault();
				lastFocusableEl.focus();
			}
		}

		// redirect first shift+tab to last element inside modal
		firstFocusableEl.addEventListener("keydown", firstFocusableElmCb);

		const handleClick = (e) => {
			if (e.target === node) {
				showGroupSessionCreator.set(false);
			}
		};
		// close modal on click outside
		node.addEventListener("click", handleClick);

		// set focus on first element inside modal
		firstFocusableEl.focus();

		return {
			destroy() {
				lastFocusableEl.removeEventListener("keydown", lastFocusableElmCb);
				firstFocusableEl.removeEventListener("keydown", firstFocusableElmCb);
				node.removeEventListener("click", handleClick);
			},
		};
	};
</script>

{#if $showGroupSessionCreator}
	<div
		class="backdrop"
		style="z-index: 1000; background-color: rgba(0, 0, 0, 0.6);"
		transition:fade|global
	>
		<div
			inert={false}
			tabindex="-1"
			class="groupSessionCreator modal"
			use:focusLock
			on:click_outside={() => ($showGroupSessionCreator = false)}
			use:clickOutside
		>
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
								<div class="input">
									<input
										type=""
										class="input"
										bind:value={displayName}
									/>
								</div>
							</div>
							<div class="container">
								<p class="h4 my-2">Settings</p>
								<div>
									<p style="display:inline-block;">
										Force Sync
										<input
											type="checkbox"
											style="vertical-align: middle; margin-left: 1em;"
											bind:checked
										/>
									</p>
								</div>
								<br />
								<div>
									<Button
										type="submit"
										disabled={displayName ? false : true}
										on:click={handleSubmit}>Create Group Session</Button
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
							Your group session has been created! You can invite anyone to join
							your session by sending them the link found below!
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

<style
	src="./index.scss"
	lang="scss"
>
</style>
