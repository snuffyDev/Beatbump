<script lang="ts">
	import { browser } from '$app/env'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	let createSenderOffer = () => {}
	let setRemoteDesc = (offer: any) => {}
	onMount(async () => {
		const importFn = await import('./_webRTC')
		createSenderOffer = await importFn.createSenderOffer
		setRemoteDesc = await importFn.setRemoteDesc
	})

	let id = 'generate id'
	let peerID = 'recipient id'
	let peerOffer
	let copyText = 'copy'
	let offer
	// type 'offer' = true | 'answer' = false
	let type = false
	$: stepCounter = 0
	let localConn
	let remoteConn
	// ! RTC !
	const config = { iceServers: [{ urls: 'stun:stun.1.google.com:19302' }] }

	let dc
	const local = async () => {
		if (!browser) return
		localConn = new RTCPeerConnection(config)
		let remoteConn = new RTCPeerConnection(config)

		let sendChannel = localConn.createDataChannel('transfer')
		sendChannel.onopen = (e) => console.log('open! ' + e)

		localConn.onicecandidate = (e) =>
			!e.candidate ||
			remoteConn.addIceCandidate(e.candidate).catch((err) => console.log(err))

		localConn
			.createOffer()
			.then(async (offer) => {
				const desc = await localConn.setLocalDescription(offer)
				await postID(desc)
				return desc
			})
			.then(() => remoteConn.setRemoteDescription(localConn.localDescription))
			.then(async () => {
				const answer = remoteConn.createAnswer()
				await postID(answer)
				return answer
			})
			.then((answer) => remoteConn.setLocalDescription(answer))
			.then(() => localConn.setRemoteDescription(remoteConn.localDescription))
			.catch((err) => console.log(err))
	}

	const remote = async () => {
		// remoteConn.ondatachannel = receivedCb()
		if (!browser) return
		remoteConn.onicecandidate = (e) =>
			!e.candidate ||
			localConn.addIceCandidate(e.candidate).catch(handleAddCandidateError)
	}
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

	async function postID(offer) {
		const response = await fetch('/library/post.json', {
			method: 'POST',
			body: JSON.stringify({
				item: {
					key: id,
					offer
				}
			})
		})
		const data = await response.json()
		console.log(data)
	}
	const getID = async () => {
		const response = await fetch(
			'/library/get.json?id=' + encodeURIComponent(peerID),
			{
				method: 'GET'
			}
		)
		const { data } = await response.json()
		const offer = await data.offer.sdp
		peerID = await data.key
		console.log(offer)
		if (offer) {
			connect(offer)
		}
	}
	async function connect(sdp) {
		const connectIDs = await setRemoteDesc(sdp)
		console.log(sdp, connectIDs)
	}
	function dcInit() {
		if (!browser) return
		dc = pc.createDataChannel('chat')
		dc.onopen = () => console.log('Chat!')
		dc.onmessage = (e) => console.log(e.data)
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
						<input id="radio" type="checkbox" bind:value={type} />
					</label>
					{type ? 'offer' : 'answer'}
					<button
						on:click={async () => {
							if (!browser) return
							local()
							const id = ID()
							offer = await createSenderOffer()
							console.log(await id, await offer)
						}}>Generate</button
					>
					<button
						on:click={() => {
							postID(offer)
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
							getID()
						}}
					/>
					<button
						on:click={async () => {
							getID()
						}}>Get Other ID</button
					>
					<button
						on:click={() => {
							console.log(peerOffer)
							connect(peerOffer)
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
		--padding: 0 var(--md-spacing) 0 var(--md-spacing);
	}
	.sync-wrapper {
		position: relative;
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
		position: fixed;
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
		height: 75%;
		min-height: 50%;
		max-height: 100%;
		border-radius: var(--lg-radius);
		background: var(--dark-top);
		@media only screen and (max-width: 640px) {
			top: 25%;
			left: 0;
			width: 100%;
			height: 45%;
			transform: translate(0, 0);
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
		// width: 95%;
		// padding: 1.25rem;
		// border-radius: var(--lg-radius);
		// background: rgba(170, 170, 170, 0.034);
		background-clip: content-box;
		padding-top: 1rem;
	}
	.screen-wrapper {
		height: 100%;
		width: 100%;
		position: relative;
	}
	.next {
		margin-top: auto;
		margin-bottom: 1rem;
	}
	.nextbtn {
		width: 100%;
	}
	.screen {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;

		// height: 100%;
		// height: 100%;
	}
	p {
		margin: 0 0 var(--md-spacing) 0;
		font-size: 1.125rem;
	}
</style>
