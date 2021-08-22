<script lang="ts">
	import { browser } from '$app/env'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	// import { createSenderOffer, setRemoteDesc } from './_webRTC'
	let id = 'generate id'
	let peerID = 'recipient id'
	let peerOffer
	let copyText = 'copy'
	let offer

	let type = false
	$: stepCounter = 0

	const ID = () => {
		id = Math.random().toString(36).substr(2, 9)
		return id
	}
	const nextStep = () => {
		if (stepCounter == 2) {
			stepCounter = 0
		} else {
			stepCounter++
		}
	}
	const dispatch = createEventDispatcher()
</script>

<div class="sync-wrapper" transition:fade>
	<div class="backdrop" />
	<div class="sync">
		<div
			class="x-button"
			on:click={() => {
				dispatch('close')
			}}
		>
			<Icon name="x" size="1.5rem" />
		</div>
		<div class="screen-wrapper" id="sWrapper">
			{#if stepCounter == 0}
				<div class="screen" transition:fly>
					<div class="content">
						<h1>Sync your data</h1>
						<div class="subheading">Follow these steps on both devices</div>
						<p>
							Securely sync your data across your devices! <br /> To begin, open
							this screen on your other device. After that, hit 'next'
						</p>
					</div>
				</div>
			{:else if stepCounter == 1}
				<div class="screen" transition:fly>
					<div class="content">
						<h1>Generate an ID</h1>
						<div class="subheading">This ID will help connect your devices</div>
						<p>
							On both devices, click the generate button to create a temporary
							ID. Make sure to remember them!
						</p>
						<hr />
						<div class="id">
							<p>Your ID:</p>

							<div class="id-cont">
								<code>{id} </code>
								<p
									class="copy link"
									on:click={async () => {
										if (!browser) return
										await navigator.clipboard.writeText(id)
										copyText = 'copied!'
										setTimeout(() => {
											copyText = 'copy'
										}, 1500)
									}}
								>
									{copyText}
								</p>
							</div>
						</div>
					</div>
					<label for="radio">
						<input id="radio" type="checkbox" bind:checked={type} />
					</label>
					{type ? 'offer' : 'answer'}
					<button
						on:click={async () => {
							if (!browser) return
							// local()
							const id = ID()
							// offer = await createSenderOffer()
							// console.log(await id, await offer)
						}}>Generate</button
					>
					<button
						on:click={() => {
							// postID(offer)
							alert('Not implemented yet!')
						}}>Post ID</button
					>
				</div>
			{:else if stepCounter == 2}
				<div class="screen" transition:fly>
					<div class="content">
						<h1>Get the other ID</h1>
						<div class="subheading">Let's find the other device</div>
						<p>
							After generating an ID for both devices, enter the other's ID in
							the field below.
						</p>
						<hr />
						<div class="id">
							<p>Your ID:</p>

							<div class="id-cont">
								<code>{id} </code>
							</div>
							<div class="id-cont">
								<code>{peerID} </code>
							</div>
						</div>
					</div>
					<input
						bind:value={peerID}
						on:submit|preventDefault={async () => {
							// getID()
							alert('Coming soon!')
						}}
					/>
					<button
						on:click={async () => {
							alert('Coming soon!')
							// getID()
						}}>Get Other ID</button
					>
					<button
						on:click={() => {
							console.log(peerOffer)
							alert('Coming soon!')
							// connect(peerOffer)
						}}>Connect</button
					>
				</div>{:else if stepCounter == 3}{/if}
		</div>
		<div class="next">
			<button class="nextbtn" on:click={nextStep}>Next Step</button>
		</div>
	</div>
</div>

<style lang="scss">
	:root {
		--padding: var(--md-spacing);
	}
	.sync-wrapper {
		position: fixed;
		width: 100%;
		height: 100%;
		// max-height: 95%;
		z-index: 1;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}
	.backdrop {
		z-index: 1;
		position: absolute;
		height: 100%;
		width: 100%;
		background: #0000009c;
	}
	code {
		background: rgba(41, 41, 41, 0.555);
		padding: 1rem;
		border-radius: var(--lg-radius);
		margin-bottom: 0.8rem;
		display: inline;
		// user-select: text;
		// cursor: text;
		cursor: text;
		user-select: text;
	}
	.id-cont {
		display: flex;
		align-items: flex-end;
	}
	hr {
		border-color: rgba(170, 170, 170, 0.199);
		border-radius: var(--lg-radius);
	}
	.id {
		display: flex;
		flex-direction: column;
	}
	.copy {
		// margin-left: auto;
		font-size: 0.95rem;
		color: #aaa;
		margin-left: 1rem;
	}
	.sync {
		display: flex;
		position: absolute;
		transform: translate(-50%, -50%);
		top: 50%;
		left: 50%;
		flex-direction: column;
		z-index: 5;
		padding: var(--padding);

		width: 50%;
		// justify-content: space-between;
		border: rgba(170, 170, 170, 0.068) 1px solid;
		box-shadow: 0 0 1rem 0rem rgba(41, 41, 41, 0.116);
		// height: 75%;

		min-height: 50%;
		border-radius: var(--lg-radius);
		background: var(--dark-top);
		@media only screen and (max-width: 640px) {
			// top: 25%;
			// top: 0;
			// left: 0;
			width: 100%;
			// bottom: 0;
			// overflow-y: hidden;
			// height: 100%;
			// transform: translate(0, 0);
		}
	}
	.x-button {
		width: auto;
		position: absolute;
		right: 1rem;
		top: 1rem;
		cursor: pointer;
		z-index: 10;
	}
	.subheading {
		font-size: 1.5rem;
	}
	.content {
		// margin-bottom: 100%;
		position: relative;
		// max-height: 100%;

		// width: 95%;
		// padding: 1.25rem;
		// border-radius: var(--lg-radius);
		// background: rgba(170, 170, 170, 0.034);
		background-clip: content-box;
		padding-top: 1rem;
	}
	.screen-wrapper {
		height: 100%;
		// width: 100%;
		position: relative;
	}
	.next {
		margin-top: 1rem;
		margin-bottom: 1rem;
		// padding-top: 100%;
	}
	.nextbtn {
		width: 100%;
	}
	.screen {
		// position: absolute;
		max-height: 100%;
		width: 100%;
		// position: relative;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		// height: 100%;
		// height: 100%;
	}
	p {
		margin: 0 0 var(--md-spacing) 0;
		font-size: 1.125rem;
	}
</style>
