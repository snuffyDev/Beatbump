<script lang="ts">
	import { alertHandler } from "$lib/stores/stores";

	import { createEventDispatcher } from "svelte";
	import { fade, fly } from "svelte/transition";
	let thumbnail;
	const readFiles = (
		e: Event & {
			target: HTMLInputElement & EventTarget;
			currentTarget: HTMLInputElement & EventTarget;
		},
	) => {
		const files = e.target.files[0];
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			let result = reader.result;
			thumbnail = result;
		});
		if (files) {
			reader.readAsDataURL(files);
		}
	};
	const dispatch = createEventDispatcher();
</script>

<div class="backdrop" on:click={() => dispatch("close")} transition:fade={{ duration: 125 }} />

<section class="playlist-modal" transition:fly={{ duration: 250, delay: 125 }}>
	<div class="image">
		{#if thumbnail}
			<img src={thumbnail} width="200" height="200" alt="thumbnail" />
		{:else}
			<img
				src={"data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIxMDAgLTEzLjA4OSA1MDAgNTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiNhNmE2YTYiIGQ9Ik0xMDAtMTMuMDg5aDUwMHY1MDBIMTAweiIvPjxwYXRoIGQ9Ik0zNjUuMTIzIDMzNy4yMzdoLTMydi03OS41NzZoLTc5LjU3NXYtMzJoNzkuNTc1di03OS41NzVoMzJ2NzkuNTc1SDQ0NC43djMyaC03OS41NzZ6IiBmaWxsPSIjZDhkOGQ4Ii8+PC9zdmc+"}
				width="200"
				height="200"
				alt="thumbnail"
			/>
		{/if}
		<div class="input-row">
			<label class="file"
				><input type="file" accept=".jpg,.png,.webp,.jpeg" on:change={readFiles} /><span class="file-button" /></label
			><!-- WIP -->
		</div>
	</div>
	<form
		on:submit|preventDefault={() => {
			alertHandler.set({
				msg: "Testing -- currently unimplemented",
				type: "error",
			});
			dispatch("close");
		}}
	>
		<div class="input-row">
			<label for="">Title</label>
			<div class="input"><input type="text" /></div>
		</div>
		<div class="input-row">
			<label for="">Description</label>
			<div class="input"><input type="text" /></div>
		</div>
		<button
			on:click|preventDefault={() => {
				alertHandler.set({
					msg: "Testing -- currently unimplemented",
					type: "error",
				});
				dispatch("close");
			}}>Submit</button
		>
	</form>
</section>

<style lang="scss">
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
		button {
			margin-bottom: 0 !important;
		}
	}
	[type="file"] {
		min-width: 10rem;
		margin: 0;
		filter: opacity(0);
		opacity: 0;
	}
	[type="file"]::-webkit-file-upload-button {
		visibility: hidden;
	}
	.file {
		position: relative;
		display: inline-block;
		cursor: pointer;
		height: 2.5rem;
		font-variant-caps: unset;
		max-width: 15.5rem;
	}
	.file-button {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
			"Open Sans", "Helvetica Neue", sans-serif;
		&:hover::after {
			background: #525252b2;
		}
	}
	.file-button::before {
		content: "Choose an image";
		display: inline-block;
		background: var(--form-bg);
		border: 0.0625rem solid hsla(0, 0%, 66.7%, 0.219);
		border-radius: $md-radius;
		box-shadow: inset 0.1125em -0.1125em 1em 0.5em hsla(0, 0%, 96.9%, 0.014), 0 0 0.25em 0.02em hsla(0, 0%, 66.7%, 0) !important;

		padding: 0.4rem 0.7rem;
		outline: none;
		white-space: nowrap;
		-webkit-user-select: none;
		position: absolute;
		inset: 0;
		width: inherit;
		height: inherit;
		color: #e3e3e3;
		// color: rgb(53, 53, 53) !important;
		cursor: pointer;
		// text-shadow: 1px 1px #fff;
		// font-weight: 700;
		font-variant-caps: unset !important;
		font-size: 10pt;
	}
	.file-button::after {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		// left:0;
		content: "Select";
		color: rgb(238, 238, 238);
		background: #353535b2;
		display: block;
		font-weight: 500;
		// padding: ;
		padding: 0.4rem 0.7rem;
		transition: background linear 125ms;
	}
	[type="file"]:hover::before {
		border-color: black;
	}
	[type="file"]:active::before {
		background: -webkit-linear-gradient(to top, #e3e3e3, #f9f9f9);
	}
	.playlist-modal {
		position: fixed;
		gap: 0.8rem;

		z-index: 100;
		background: var(--mobile-popper-bg);
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		top: 50%;
		left: 50%;
		min-width: 50%;
		min-height: 50%;
		width: fit-content;
		max-width: 100%;
		max-height: 100%;
		border-radius: $lg-radius;
		border-color: rgba(129, 129, 129, 0.411);
		border-width: 0.025rem;
		border-style: solid;
		transform: translate(-50%, -50%);
		padding: 0.8rem;
	}
	.image {
		align-self: center;
	}
</style>
