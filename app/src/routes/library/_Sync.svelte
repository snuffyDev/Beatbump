<script context="module" lang="ts">
	import { browser } from "$app/environment";
	let _Peer: typeof Peer;
	let RTC_module;
	if (browser) {
		RTC_module = import("peerjs");
		RTC_module.then((module) => {
			_Peer = module.default;
		});
	}
</script>

<script lang="ts">
	import type Peer from "peerjs";
	import Icon from "$lib/components/Icon/Icon.svelte";
	import { IDBService } from "$lib/workers/db/service";
	import { alertHandler } from "$lib/stores/stores";
	import { createEventDispatcher, onMount, tick } from "svelte";
	import { fade } from "svelte/transition";
	import type { Item } from "$lib/types";
	import { notify } from "$lib/utils";
	import { setMultiplePlaylists } from "$lib/workers/db/db";

	type PeerType = "Sender" | "Receiver";

	let peer: Peer;

	let id = "unset";
	let peerID = "";
	let copyText = "copy";
	let completed = false;
	let check: string;
	let peerType: PeerType;
	let stepCounter = 0;
	let RTC;

	$: peerType = check == "sending" ? "Sender" : "Receiver";
	$: type = check == "sending" ? true : false;
	$: connection = undefined;
	const dataType = ["Playlists", "Favorites"];
	let kindOfData = dataType;
	const dispatch = createEventDispatcher();
	const stores: {
		[functionName: string]: Function;
	} = {
		Playlists: async () => {
			const _lists = await IDBService.sendMessage("get", "playlists");
			const lists = await [..._lists];
			const returned = lists;
			if (lists.length !== 0) {
				return [...returned];
			}
		},
		Favorites: async () => {
			const _lists = await IDBService.sendMessage("get", "favorites");
			const lists = await [..._lists];
			const returned = lists;
			if (lists.length !== 0) {
				return [...returned];
			}
		},
	};
	const getObjectStores = (kindOfData: string[]) => {
		if (kindOfData.length == 0) return;
		return Promise.all([
			...kindOfData.map((kind) =>
				stores[kind]()
					.then((data) => {
						const items = data;
						return items;
					})
					.then((list) => {
						return {
							type: kind,
							items: list,
						};
					}),
			),
		]);
	};
	const ID = () => {
		if (!RTC && !browser) return;

		id = "bb-" + Math.random().toString(36).substr(2, 7);
		peer = new RTC(id);
		console.log(`Peer ${id} created!`);
		if (!type) {
			console.log(peer);
			peer.on("connection", (conn) => {
				console.log(conn);
				conn.on("data", async (data) => {
					connection = { data, conn };
					console.log(connection);
					// When data is received from sender,
					// write the contents to IndexedDB
					const ArrayOfStores = JSON.parse(data as string);
					if (Array.isArray(ArrayOfStores)) {
						ArrayOfStores.forEach(async (obj) => {
							if (obj?.type == "Playlists") {
								const itemList = obj;
								await setMultiplePlaylists([...itemList?.items]);
							}
							if (obj?.type == "Favorites") {
								const itemList = obj;
								await setMultiplePlaylists([...itemList?.items]);
							}
						});
						console.log(ArrayOfStores);
					}

					notify("Data sync completed!", "success");
					setTimeout(() => {
						completed = true;
					}, 1250);
					await tick();
					conn.close();
					peer.destroy();

					dispatch("close");
					if (completed === true) {
					}
				});
				conn.on("open", () => {
					notify("Connection established!", "success");
				});
			});
		}
		return "bb-" + id;
	};
	const nextStep = () => {
		if (stepCounter == 3) {
			dispatch("close");
		} else {
			stepCounter++;
		}
	};

	async function connect() {
		if (!browser) return;
		if (!type) {
			// Receiver Connection
		} else {
			// Sender Connection
			const data = await getObjectStores(kindOfData);
			const chData = await JSON.stringify(data);
			console.log(data, chData);
			const conn = peer.connect(peerID);
			conn.on("open", () => {
				// Transfer to Receiver
				conn.send(chData);
			});
			conn.on("data", (data) => {});

			conn.on("close", () => {
				peer.destroy();
				dispatch("close");
			});
		}
	}
	onMount(async () => {
		if (!_Peer) {
			const _module = await RTC_module;
			RTC = _module.default;
		} else {
			RTC = _Peer;
		}
	});
	// $: console.log(RTC, _Peer)
	function keyDownListener(event: KeyboardEvent) {
		if (event.key == "Esc" || event.key == "Escape") {
			event.preventDefault();
			dispatch("close");
		}
		if (event.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}
	}
</script>

<svelte:window on:keydown={keyDownListener} />
<div class="backdrop" on:click={() => dispatch("close")} transition:fade={{ duration: 150, delay: 150 }} />
<div class="sync-wrapper">
	<div class="sync" transition:fade={{ duration: 300, delay: 300 }}>
		<div
			class="x-button"
			on:click={() => {
				dispatch("close");
			}}
		>
			<Icon name="x" size="1.5rem" />
		</div>
		<div class="screen-wrapper" id="sWrapper">
			{#if stepCounter == 0}
				<div class="screen">
					<div class="content">
						<h1>Sync your data</h1>
						<div class="subheading">Access your favorites on any device</div>
						<p>
							Securely sync your data across your devices! <br /> To begin, open this screen on another device. Whenever
							you are ready, hit 'Next Step'
						</p>
					</div>
				</div>
				<div class="next">
					<button class="nextbtn" on:click={nextStep}>Next Step</button>
				</div>
			{:else if stepCounter == 1}
				<div class="screen">
					<div class="content">
						<h1>First things first...</h1>
						<div class="subheading">
							Will this device be <em>sending</em> or <em>receiving</em> data?
						</div>
						<!-- <p>Follow these steps on both devices.</p> -->
						<section class="container row justify">
							<div class="radio">
								<label for="sending">
									<input
										id="sending"
										type="checkbox"
										on:input={() => (check = "sending")}
										checked={check == "sending"}
									/>
									<span class="checkbox-tile"><Icon name="send" size="2em" /><span class="label">Sending</span></span>
								</label>
							</div>
							<div class="radio">
								<label for="receiving">
									<input
										id="receiving"
										type="checkbox"
										on:input={() => (check = "receiving")}
										checked={check == "receiving"}
									/>
									<span class="checkbox-tile"
										><Icon name="import" size="2em" /><span class="label">Receiving</span></span
									>
								</label>
							</div>
						</section>
					</div>
					<hr />
					{#if check == "sending"}
						<div class="content">
							<span class="subheading">What kind of data would you like to send?</span>
							<div class="container">
								{#each dataType as option}
									<label>
										{option}
										<input type="checkbox" bind:group={kindOfData} value={option} name="dataType" />
									</label>
								{/each}
							</div>
						</div>
					{/if}
				</div>
				<div class="next">
					<button
						class="nextbtn"
						disabled={check == "sending" ? check == "sending" && kindOfData.length === 0 : check == undefined}
						on:click={() => {
							if (check !== undefined) nextStep();
						}}>Next Step</button
					>
				</div>
			{:else if stepCounter == 2}
				<div class="screen">
					<div class="content">
						<h1>Generate Your ID</h1>
						<div class="subheading">The temporary ID is needed for syncing</div>
						<hr />

						<section class="container">
							<div class="id">
								<p>Your ID:</p>

								<div class="id-cont">
									<code>{id} </code>
									<p
										class="copy link"
										on:click={async () => {
											if (!browser) return;
											await navigator.clipboard.writeText(id);
											copyText = "copied!";
											setTimeout(() => {
												copyText = "copy";
											}, 1500);
										}}
									>
										{copyText}
									</p>
								</div>
							</div>
							<button
								class="small"
								on:click={async () => {
									if (!browser) return;

									ID();
								}}>Create ID</button
							>
						</section>
					</div>
				</div>
				<div class="next">
					<button
						class="nextbtn"
						disabled={id == "unset"}
						on:click={() => {
							if (id !== "unset") nextStep();
						}}>Next Step</button
					>
				</div>
			{:else if stepCounter == 3}
				<div class="screen">
					{#if check == "sending"}
						<div class="content">
							<h1>
								Get the {(peerType = check !== "sending" ? "Sender" : "Receiver")}'s ID
							</h1>
							<div class="subheading">Let's find the other device</div>
							<p>After generating an ID for both devices, enter the other's ID in the field below.</p>
							<hr />
							<div class="id">
								<p>Your ID:</p>

								<div class="id-cont">
									<code>{id} </code>
								</div>

								<p>
									{(peerType = check !== "sending" ? "Sender" : "Receiver")}'s ID:
								</p>

								<div class="id-cont">
									<input
										on:submit|preventDefault={async () => {
											connect();
										}}
										bind:value={peerID}
										class="input"
										placeholder={`${peerType}'s ID`}
										type="text"
										autocapitalize="off"
										autocomplete="off"
										autocorrect="off"
										spellcheck="false"
										pattern="bb?[a-zA-Z0-9_-]+"
									/>
								</div>
							</div>
						</div>
						<div class="next">
							<button
								class="nextBtn"
								disabled={peerID.length < 1}
								on:click={() => {
									connect();
								}}>Connect</button
							>
						</div>
					{:else}
						<div class="content">
							<h1>Ready to Receive Data</h1>
							<span
								>Your ID: <div class="id-cont"><code>{id}</code></div></span
							>
							<div class="subheading">Waiting for sender to connect.</div>
							<p>Once data transfer is completed, this popup window will close automatically</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.has-icon {
		width: auto;
	}
	.justify {
		justify-content: space-evenly;
	}
	.label {
		color: #f2f2f2;
	}
	.checkbox-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 7rem;
		min-height: 7rem;
		border-radius: 0.5rem;
		border: 2px solid rgba(181, 191, 217, 0.267);
		background-color: rgba(117, 117, 117, 0.26);
		box-shadow: 0 5px 10px rgba(#000, 0.1);
		transition: 0.15s ease;
		cursor: pointer;
		position: relative;

		&:before {
			content: "";
			position: absolute;
			display: block;
			width: 1.25rem;
			height: 1.25rem;
			border: 2px solid #b5bfd9;
			background-color: rgba(117, 117, 117, 0.26);
			border-radius: 50%;
			top: 0.25rem;
			left: 0.25rem;
			opacity: 0;
			transform: scale(0);
			transition: 0.25s ease;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' fill='%23FFFFFF' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='none'%3E%3C/rect%3E%3Cpolyline points='216 72.005 104 184 48 128.005' fill='none' stroke='%23FFFFFF' stroke-linecap='round' stroke-linejoin='round' stroke-width='32'%3E%3C/polyline%3E%3C/svg%3E");
			background-size: 12px;
			background-repeat: no-repeat;
			background-position: 50% 50%;
		}

		&:hover {
			border-color: #3b9b9b;
			&:before {
				transform: scale(1);
				opacity: 1;
			}
		}
	}

	.radio {
		position: relative;
		label input[type="checkbox"] {
			// opacity: 0;
			// Code to hide the input
			appearance: none;
			clip: rect(0 0 0 0);
			clip-path: inset(100%);
			height: 1px;
			overflow: hidden;
			position: absolute;
			white-space: nowrap;
			width: 1px;

			&:checked + .checkbox-tile,
			&:checked + .checkbox-tile .label {
				border-color: #3b9b9b;
				color: #f2f2f2;
				text-shadow: 0 0 0.25rem rgba(255, 255, 255, 0.63);
				&:not(.label) {
					background-color: rgba(201, 201, 201, 0.274);
					box-shadow: 0 5px 10px rgba(#000, 0.1);
				}
				&:before {
					transform: scale(1);
					opacity: 1;
					background-color: #3b9b9b;
					border-color: #2260ff;
				}
			}
		}
	}

	.inline {
		display: flex;
		align-items: flex-start;
		/* height: auto; */
		min-height: 5ch;
		/* max-height: 30ch; */
		/* margin-left: auto; */
		flex-direction: row;
		flex-wrap: nowrap;
	}
	.id-container {
		display: inline-flex;
		flex-direction: column;
	}

	.input {
		background-color: #2929298e !important;
		margin-bottom: 0.5rem;
	}
	:root {
		--padding: 0 $xl-spacing 0 $xl-spacing;
	}
	.sync-wrapper {
		display: grid;
		align-items: center;
		justify-items: center;

		max-height: 100%;
		grid-template-columns: 1fr;
		z-index: 5;
	}
	.backdrop {
		z-index: 1;
		position: fixed;
		height: 100%;
		width: 100%;
		background: #0000009c;
		overflow: hidden;
	}
	code {
		background: rgba(41, 41, 41, 0.555);
		padding: 1rem;
		border-radius: $lg-radius;
		display: inline;
		font-size: 1.125em;
		font-weight: 400;
		letter-spacing: 0.01em;
		// user-select: text;
		// cursor: text;
		cursor: text;
		user-select: text;
	}
	.id-cont {
		display: flex;
		margin-bottom: 0.8rem;
		align-items: flex-end;
	}
	hr {
		border-color: rgba(170, 170, 170, 0.199);
		border-radius: $lg-radius;
	}
	.id {
		display: flex;
		flex-direction: column;
		margin-bottom: 1.2rem;
	}
	.copy {
		// margin-left: auto;
		font-size: 0.95rem;
		color: #aaa;
		margin-left: 1rem;
	}
	.sync {
		position: fixed;
		top: 50%;
		/* bottom: 0; */
		left: 50%;
		min-height: 0;
		transform: translate(-50%, -50%);
		flex-direction: row;
		transform-origin: top;
		flex-wrap: wrap;
		z-index: 5;
		padding: var(--padding);
		width: 50%;
		flex: 1 1 100%;
		border: 1px solid #aaa1;
		transform-origin: top;
		box-shadow: 0 0 1rem #2929291f;
		border-radius: $lg-radius;
		background: #111214;
		@media only screen and (max-width: 640px) {
			// top: 0;
			// left: 0;
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
		font-size: 1.3125em;
	}
	.content {
		position: relative;
		// background-clip: content-box;
		padding: 1rem;
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
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
	}
	.nextbtn {
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		@media screen and (min-width: 40em) {
			width: unset;
		}
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
		margin: 0 0 $sm-spacing 0;
		font-size: 1.125rem;
	}
	h1 {
		margin-top: 0;
	}
</style>
