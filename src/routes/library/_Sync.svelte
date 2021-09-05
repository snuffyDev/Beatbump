<script lang="ts">
	import { browser } from '$app/env'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import Peer from 'peerjs?client'
	import db from '$lib/db'
	import { alertHandler } from '$lib/stores/stores'

	// }
	let peer
	// $: Peer = undefined

	let id = 'generate id'
	let peerID = ''
	let peerOffer
	let copyText = 'copy'
	$: completed = false
	let offer
	// type 'connect' = true | 'reciever' = false
	$: type = false
	$: stepCounter = 0

	const ID = () => {
		if (!Peer && !browser) return
		id = 'bb-' + Math.random().toString(36).substr(2, 7)
		peer = new Peer(id)
		console.log(peer, id)

		return 'bb-' + id
	}
	const nextStep = () => {
		if (stepCounter == 2) {
			stepCounter = 0
		} else {
			stepCounter++
		}
	}

	async function connect() {
		if (!browser) return
		// !type === connect
		// type === receiver
		if (!type) {
			peer.on('connection', (conn) => {
				conn.on('data', async (data) => {
					// Will print 'hi!'
					await db.setMultiple(JSON.parse(data))
					alertHandler.set({ msg: 'Data sync completed!', type: 'success' })
					console.log('received data' + data)
					setTimeout(() => {
						completed = true
						alertHandler.set({
							msg: 'Data sync complete! Closing connection...',
							type: 'success'
						})
					}, 1250)
				})
				conn.on('open', () => {
					alertHandler.set({ msg: 'Connection established!', type: 'success' })
					// conn.send('hello!')
				})
			})
			if (completed === true) {
				peer.destroy()
				dispatch('close')
			}
		} else {
			const information = await db.getFavorites()
			const chData = JSON.stringify(information)
			const conn = peer.connect(peerID)
			conn.on('open', () => {
				conn.send(chData)
			})
			conn.on('close', () => {
				peer.destroy()
				dispatch('close')
			})
		}
	}
	const getID = async () => {
		const response = await fetch(
			'/library/get.json?id=' + encodeURIComponent(peerID),
			{
				method: 'GET'
			}
		)
	}

	const dispatch = createEventDispatcher()
</script>

<div class="backdrop" transition:fade />
<div class="sync-wrapper">
	<div class="sync" transition:fade>
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
				<div class="screen">
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
				<div class="screen">
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
					<div class="container">
						I am {type ? 'Sending' : 'Receiving'}:
						<input id="radio" type="checkbox" bind:checked={type} />
						<label for="radio" />
					</div>
					<button
						on:click={async () => {
							if (!browser) return
							ID()
						}}>Generate</button
					>
				</div>
			{:else if stepCounter == 2}
				<div class="screen">
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
						class="input"
						placeholder="other device id"
						type="text"
						autocapitalize="off"
						autocomplete="off"
						pattern="[A-Za-z0-9_-]+"
						on:submit|preventDefault={async () => {
							connect()
						}}
					/>

					<button
						on:click={() => {
							connect()
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
	.container {
		display: flex;
		margin-bottom: 0.5rem;
	}
	input[type='checkbox'] {
		margin-left: var(--md-spacing);
		margin-bottom: 1.2rem;

		height: 0;
		width: 0;
		visibility: hidden;
	}
	input:checked + label::after {
		left: calc(100% - 0.333333rem);
		transform: translateX(-100%);
	}
	input:checked + label {
		background-color: #4a7eb2;
	}

	label:active::after {
		// width: .03333333rem;
	}
	label {
		background-color: #444857;
		border-radius: 10rem;
		position: relative;
		cursor: pointer;
		transition: 0.25s;
		// box-shadow: 0 0 1.2rem #477a8550;
		display: block;
		width: 5rem;
		height: 2.1rem;

		&::after {
			content: '';
			width: 1.25rem;
			height: 1.25rem;
			background-color: #e8f5f7;
			position: absolute;
			border-radius: 5.833333rem;
			top: 20%;
			left: 0.3125rem;
			transition: 0.25s;
		}
	}

	.input {
		background-color: #2929298e !important;
		margin-bottom: 0.5rem;
	}
	:root {
		--padding: 0 var(--md-spacing) 0 var(--md-spacing);
	}
	.sync-wrapper {
		position: absolute;
		display: grid;
		align-items: center;
		justify-items: center;
		width: 100%;
		height: 100%;
		max-height: 100%;
		grid-template-columns: 1fr;
	}
	.backdrop {
		z-index: 1;
		position: fixed;
		overflow: hidden;
		height: 100%;
		width: 100%;
		background: #0000009c;
		overflow: hidden;
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
		position: relative;
		top: 0;
		/* left: 50%; */
		bottom: 0;
		min-height: 0;
		/* transform: translate(-50%,-50%); */
		flex-direction: row;
		flex-wrap: wrap;
		z-index: 5;
		padding: var(--padding);
		width: 50%;
		flex: 1 1 100%;
		border: 1px solid #aaa1;
		transform-origin: top;
		box-shadow: 0 0 1rem 0 rgb(41 41 41 / 12%);
		/* max-height: 100%; */
		/* min-height: 100%; */
		border-radius: var(--lg-radius);
		background: var(--dark-top);
		@media only screen and (max-width: 640px) {
			top: 0;
			left: 0;
			width: 100%;
			// height: 100%;
			min-height: 0;
			// transform: translate(0, 10vh);
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
		position: relative;
		background-clip: content-box;
		padding-top: 1rem;
		min-height: 0;
	}
	.screen-wrapper {
		height: 100%;
		width: 100%;
		position: relative;
	}
	.next {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	.nextbtn {
		width: 100%;
	}
	.screen {
		/* position: absolute; */
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
	p {
		margin: 0 0 var(--md-spacing) 0;
		font-size: 1.125rem;
	}
</style>
