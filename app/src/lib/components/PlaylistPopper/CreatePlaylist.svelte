<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { IDBService } from "$lib/workers/db/service";

	import { showAddToPlaylistPopper } from "$lib/stores/stores";

	import { createEventDispatcher, onMount } from "svelte";
	import { fade, fly } from "svelte/transition";
	import Icon from "../Icon/Icon.svelte";
	import Modal from "../Modal";
	export let defaults: {
		name?: string;
		thumbnail?: any;
		description?: string;
		id?: string;
	} = {};
	export let hasFocus = false;
	export let isLocalPlaylist = false;
	let files: Blob & FileList;
	let thumbnail = defaults?.thumbnail ?? undefined;
	let deletePlaylistRequest = false;
	const crop = () => {
		if (!browser && !thumbnail) return;
		const sourceImage = new Image();
		sourceImage.src = thumbnail;
		const outputAspectRatio = 1;
		sourceImage.onload = () => {
			const sourceWidth = sourceImage.naturalWidth;
			const sourceHeight = sourceImage.naturalHeight;

			const aspectRatio = sourceWidth / sourceHeight;

			let outputWidth = sourceWidth;
			let outputHeight = sourceHeight;
			if (aspectRatio > outputAspectRatio) {
				outputWidth = sourceHeight * outputAspectRatio;
			} else if (aspectRatio < outputAspectRatio) {
				outputHeight = sourceWidth / outputAspectRatio;
			}
			const outputX = (outputWidth - sourceWidth) * 0.5;
			const outputY = (outputHeight - sourceHeight) * 0.5;

			const output = document.createElement("canvas");
			output.width = outputWidth;
			output.height = outputHeight;

			const ctx = output.getContext("2d");

			ctx.drawImage(sourceImage, outputX, outputY);
			thumbnail = output.toDataURL();
		};
	};
	const readFiles = (files) => {
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			let result = reader.result;
			thumbnail = result;
			crop();
		});
		reader.readAsDataURL(files);
	};
	let titleValue = defaults?.name ?? undefined;
	let descriptionValue = defaults?.description ?? undefined;
	$: if (files) readFiles(files[0]);
	onMount(() => {
		const wrapper = document.getElementById("wrapper");
		if (!$page.url.pathname.includes("/search/")) {
			wrapper.classList.add("soft-no-scroll");
		}
		return () => {
			if (!$page.url.pathname.includes("/search/")) {
				wrapper.classList.remove("soft-no-scroll");
			}
		};
	});
	const dispatch = createEventDispatcher();
</script>

{#if hasFocus}
	<div
		class="backdrop"
		style="z-index: 100;"
		transition:fade={{ duration: 125 }}
		on:scroll|preventDefault
		on:click={() => {
			dispatch("close");
		}}
	/>
{/if}
{#if deletePlaylistRequest}
	<Modal
		zIndex={200}
		on:close={() => {
			deletePlaylistRequest = false;
		}}
	>
		<div class="header" slot="header">
			<h1>Delete Playlist?</h1>
			<p>
				Deleting this playlist will permanently delete all of it's data from your device (thumbnail, title, songs,
				etc.).
			</p>
			<p>This action is permanent and cannot be undone!</p>
		</div>
		<div class="body">
			<div class="image">
				<div class="img-container">
					{#if thumbnail}
						<img src={thumbnail} width="200" height="200" alt="thumbnail" />
					{:else}
						<img
							src={"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+"}
							width="200"
							height="200"
							alt="thumbnail"
						/>
					{/if}
				</div>
			</div>
			<span class="h3">{defaults?.name}</span>
			<div class="buttons">
				<button
					class="button"
					on:click|preventDefault={() => {
						deletePlaylistRequest = false;
					}}>Cancel</button
				>
				<button
					class="outlined danger"
					on:click|preventDefault={async () => {
						IDBService.sendMessage("delete", "playlist", defaults?.id);
						deletePlaylistRequest = false;

						dispatch("close");
						goto("/library");
					}}>Delete Playlist</button
				>
			</div>
		</div>
	</Modal>
{/if}
<section class="playlist-modal" transition:fade={{ duration: 250, delay: 125 }}>
	<div class="image">
		<div class="img-container">
			{#if thumbnail}
				<img src={thumbnail} width="200" height="200" alt="thumbnail" />
			{:else}
				<img
					src={"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+"}
					width="200"
					height="200"
					alt="thumbnail"
				/>
			{/if}
			<input type="file" accept=".jpg,.png,.webp,.jpeg" bind:files />
			<div class="gradient">
				<div class="icon">
					<Icon name="upload" size="1.5rem" color="#f2f2f2" />
				</div>
			</div>
		</div>
		<small><em>Upload Thumbnail</em></small>
	</div>
	<form
		on:submit|preventDefault={() => {
			dispatch("submit", {
				title: titleValue,
				description: descriptionValue,
				thumbnail,
			});
		}}
	>
		<div class="input-row">
			<label for="">Title</label>
			<div class="input no-btn block"><input type="text" bind:value={titleValue} /></div>
		</div>
		<div class="input-row">
			<label for="">Description</label>
			<div class="input no-btn block">
				<input type="text" bind:value={descriptionValue} />
			</div>
		</div>
		{#if isLocalPlaylist}
			<div class="input-row">
				<!-- <p>Delete Playlist</p> -->
				<button
					class="danger"
					on:click|preventDefault={() => {
						deletePlaylistRequest = true;
					}}>Delete Playlist</button
				>
			</div>
		{/if}
		<div class="buttons">
			<button
				class="danger outlined"
				on:click|preventDefault={() => {
					dispatch("close");
				}}>Cancel</button
			>
			<button
				disabled={!titleValue && !descriptionValue}
				on:click|preventDefault={() => {
					dispatch("submit", {
						title: titleValue,
						description: descriptionValue,
						thumbnail,
					});
				}}>{isLocalPlaylist ? "Save Changes" : "Create Playlist"}</button
			>
		</div>
	</form>
</section>

<style lang="scss">
	.gradient {
		position: absolute;
		inset: 0;
		width: 100%;
		display: flex;
		height: 100%;
		pointer-events: none;
		padding: 1rem;
		background: linear-gradient(180deg, hsl(0deg 0% 0% / 10%), hsl(0deg 0% 0% / 49%));
		align-items: flex-end;
		justify-content: flex-end;
		border-radius: var(--xs-radius);
	}
	.icon {
		position: relative;
	}
	.header {
		display: flex;
		flex-direction: column;
		// line-height: 2;
	}
	.body {
		display: flex;
		justify-content: center;
		height: 100%;
		gap: 0.8rem;
		flex-direction: column;
		align-items: center;
	}
	.img-container {
		max-width: 16rem;
		max-height: 16rem;
		height: 100%;
		width: 100%;
		position: relative;
		aspect-ratio: 1/1;
	}
	img {
		max-width: inherit;
		max-height: inherit;
		width: 100%;
		height: 100%;
	}
	.input-row {
		margin-bottom: 1.25rem;
		display: grid;
	}
	.buttons {
		margin-bottom: 0;
		display: grid;
		gap: 0.8rem;
		grid-template-columns: 1fr 1fr;
		// grid-template-rows: 1fr 1fr;
		@media screen and (min-width: 640px) {
			grid-template-rows: unset;
		}
	}
	button {
		margin-bottom: 0 !important;
	}
	form {
		display: inline-block;
		flex-direction: row;
		min-width: 50%;
		align-content: center;
		flex-wrap: wrap;
		align-self: flex-start;
		gap: 0.8rem;
		justify-self: center;
		place-content: center;
		align-items: flex-end;
		margin: 0 auto;
	}
	[type="file"] {
		min-width: 10rem;
		width: 100%;
		height: 100%;
		position: absolute;
		margin: 0;
		filter: opacity(0);
		opacity: 0;
		cursor: pointer;
		inset: 0;
		z-index: 50;
	}
	[type="file"]::-webkit-file-upload-button {
		visibility: hidden;
	}

	.playlist-modal {
		position: fixed;
		gap: 0.8rem;

		z-index: 105;
		background: var(--mobile-popper-bg);
		display: flex;
		flex-direction: column;
		// flex-wrap: wrap;
		min-width: 50%;
		min-height: 50%;
		width: fit-content;
		max-width: 100%;
		max-height: 85vh;
		// flex: 1 1 auto;
		// height: 100%;
		overflow-y: auto;
		top: 0;
		left: 0;
		top: 50%;
		// inset: 0;
		left: 50%;
		// grid-area: m/m/m/m;
		border-radius: $lg-radius;
		border-color: rgba(129, 129, 129, 0.411);
		border-width: 0.025rem;
		border-style: solid;
		transform: translate(-50%, -50%);
		padding: 1.2rem;

		// justify-content: space-around;
	}
	.image {
		align-self: center;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: hsl(200deg 7% 8% / 85%);
		padding: 1rem;
		// max-height: 14rem;
		min-height: 0;
		height: 100%;
		max-width: 16rem;
		border-radius: inherit;
		border: 1px #e3e3e32f solid;
		align-items: center;
		gap: 0.8rem;
		max-height: calc(100vmax * 0.66 - 38vmin);
		max-width: calc(100vw * 0.66 - 14vmax);
	}
</style>
