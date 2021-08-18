<script lang="ts">
	import list from '$lib/stores/list'
	import Icon from '$lib/components/Icon/Icon.svelte'
	import { theme } from '$lib/stores/stores'
	import { onMount } from 'svelte'
	import '../../../global/vars.css'

	export let header
	export let thumbnail = []
	export let description
	export let width
	let container: HTMLDivElement
	let y = 0
	let wrapper: HTMLElement
	onMount(() => {
		let start
		let scroll

		const handler = (e) => {
			if (container) scroll = container.getBoundingClientRect()
			// console.log(scroll)
			if (container) {
				y =
					window.innerWidth < 500
						? Math.min(
								Math.max((-scroll.top / window.innerHeight) * 4, 0),
								10
						  ) * 150
						: Math.min(
								Math.max((-scroll.top / window.innerHeight) * 4, 0),
								10
						  ) * 50
			}
		}
		wrapper = document.getElementById('wrapper')
		wrapper.addEventListener('scroll', () =>
			window.requestAnimationFrame(handler)
		)
		return () => {
			window.cancelAnimationFrame(y)
			wrapper.removeEventListener('scroll', () =>
				window.cancelAnimationFrame(y)
			)
		}
	})
</script>

<div class="artist-header">
	<div class="artist-thumbnail">
		<div
			bind:this={container}
			style={`background-image: linear-gradient(1turn, var(--${$theme}-base) ${Math.min(
				Math.max(10, y),
				70
			)}%, transparent); transition: cubic-bezier(0.6, -0.28, 0.74, 0.05) all 120ms`}
			id="gradient"
			class="gradient"
		/>
		{#if thumbnail !== undefined}
			<picture class="header-thumbnail">
				{#each thumbnail as img, i}
					{#if i == 0}
						<source
							media="(max-width:{img.width}px)"
							srcset={img.url}
							type="image/jpeg"
						/>
						<source
							media={`(min-width:${img.width + 1}px) and (max-width:${
								thumbnail[i + 1].width
							}px)`}
							srcset={img.url}
							type="image/jpeg"
						/>
					{:else if i == thumbnail.length - 1}
						<!-- <source
							media="(min-width:{thumbnail[i - 1]
								.width}px) and (max-width:{img.width}px)"
							srcset={img.url}
							type="image/jpeg" /> -->
					{:else}
						<source
							media={`(min-width:${img.width + 1}px) and (max-width:${
								thumbnail[i + 1].width
							}px)`}
							srcset={thumbnail[i + 1].url}
							type="image/jpeg"
						/>
					{/if}
				{/each}
				<img
					referrerpolicy="origin-when-cross-origin"
					class="header-thumbnail"
					loading="eager"
					src={thumbnail[1]?.url}
					alt="Artist Thumbnail"
				/>
			</picture>
		{/if}
		<div class="artist-content">
			<div class="content-wrapper">
				<div class="name">{header?.name}</div>
				{#if width > 500 && !!description}
					<div class="description">{description[0]}</div>
				{/if}
				<div class="btn-wrpr">
					<button
						class="radio-button"
						on:click={list.startPlaylist(header.mixInfo.playlistId)}
						><Icon size="1.25em" name="radio" /><span class="btn-text">
							Play Radio</span
						></button
					>
				</div>
			</div>
		</div>
	</div>
</div>

<!--  -->
<style lang="scss">
	button {
		flex-wrap: nowrap;
		display: inline-flex;
		place-items: center;
		color: #09090a !important;
		font-weight: 500;
		border: #09090a;
		background: white !important;
		margin-bottom: 0.8rem;

		padding: 0.3em;
	}
	.radio-button {
		margin-left: 0.5rem;
		background: transparent !important;
		border: white 0.1rem solid !important;
		color: white !important;

		&:active,
		&:hover {
			border: rgb(158, 158, 158) 0.1rem solid !important;
			background: rgba(255, 255, 255, 0.027) !important;
			box-shadow: 0 0 0.1em 0 inset black;
			color: rgb(236, 236, 236) !important;
		}
	}
	.btn-text {
		margin-left: 0.25rem;
	}

	.artist-header {
		display: block;
		// margin-bottom: 0.5rem;
		height: 100%;
		position: relative;
		max-height: 50vh;
		@media only screen and (min-width: 640px) {
			max-height: 75vh;
		}
	}
	.artist-thumbnail {
		display: block;
		position: relative;
		height: 100%;
		/* min-height: 13rem; */
		/* max-height: 30rem; */
		padding-top: 15rem;
		@media only screen and (min-width: 640px) {
			padding-top: 18rem;
		}
		// box-shadow: 0 0 0.5rem 0.5rem #000;

		&::before {
			position: absolute;
			content: '';
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}
	}

	.gradient {
		z-index: 0;
		width: 100%;
		height: inherit;
		position: absolute;

		top: 0;
	}
	.header-thumbnail {
		z-index: -1;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		max-width: 100%;
		-o-object-fit: cover;
		object-fit: cover;
		/* max-height: 23rem; */
		position: absolute;
		overflow: hidden;
		border-radius: 0;
		object-position: top;
		max-height: inherit;
	}
	.artist-content {
		position: relative;
		z-index: 1;

		padding-left: 4.5rem;

		.content-wrapper {
			// position: absolute;
			// bottom: 0;
			// margin-bottom: 0.5rem;
			.description {
				display: block;
				padding: 0.4em;
				padding-bottom: 1.2rem;
			}
			.name {
				font-weight: 700;
				font-size: 2.5rem;
				display: inline-block;
				font-family: 'Commissioner', sans-serif;

				text-shadow: rgba(0, 0, 0, 0.171) 0.2rem -0.12rem 0.5rem;

				letter-spacing: -0.02em;
				padding-left: 0.4rem;
				padding-bottom: 1rem;

				@media (min-width: 320px) and (max-width: 499px) {
					// padding: 0.8em 0 0.8rem 0.5rem;
				}
				@media (min-width: 500px) and (max-width: 640px) {
					// padding: 0.8em 0 0.8rem 1.8rem;
				}
				@media screen and (min-width: 642px) and (max-width: 839px) {
					font-size: 2rem;

					// padding: 0.8em 0 0.8rem 2rem;
				}
				@media screen and (min-width: 840px) and (max-width: 960px) {
					font-size: 3.5rem;

					inline-size: 100%;
					overflow-wrap: break-word;

					// padding: 0 2rem 0.8rem 2rem;
				}
				@media screen and (min-width: 961px) {
					// padding: 0 2rem 0.8rem 2rem;
					font-size: 4.5rem;
				}
			}
		}
		@media screen and (max-width: 500px) {
			padding: 1rem;
		}
	}
	// .btn-wrpr {
	// 	@media (min-width: 320px) and (max-width: 499px) {
	// 		padding: 0 0 0.8rem 0.5rem;
	// 	}
	// 	@media (min-width: 500px) and (max-width: 640px) {
	// 		padding: 0 0 0.8rem 1.8rem;
	// 	}
	// 	@media screen and (min-width: 642px) and (max-width: 839px) {
	// 		padding: 0 0 0.8rem 2rem;
	// 	}
	// 	@media screen and (min-width: 840px) and (max-width: 960px) {
	// 		padding: 0 2rem 0.8rem 2rem;
	// 	}
	// 	@media screen and (min-width: 961px) {
	// 		padding: 0 2rem 0.8rem 2rem;
	// 	}
	// }
</style>
