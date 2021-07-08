<script>
	import Loading from '$lib/Loading.svelte'
	import { getData } from '$lib/utils'
	import { page } from '$app/stores'

	import { onMount } from 'svelte'
	import { parseArtistPage } from '$lib/js/artistUtils'
	import Icon from '$lib/Icon.svelte'
	import ListItem from '$lib/ListItem.svelte'
	export let headerContent
	export let items = []
	export let thumbnail = []
	export let description
	export let width
	onMount(() => {})
</script>

<div class="artist-header">
	<div class="artist-thumbnail">
		<picture class="header-thumbnail">
			<img
				class="header-thumbnail"
				src={thumbnail[1].url}
				alt="Artist Thumbnail" />
		</picture>
	</div>
	<div class="artist-content">
		<div class="content-wrapper">
			<div class="name">{headerContent.name}</div>
			{#if width > 500 && !!description}
				<div class="description">{description[0]}</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.artist-body {
		padding: 0 1rem;
	}
	button {
		flex-wrap: nowrap;
		display: flex;
		place-items: center;
		color: #09090a !important;
		font-weight: 550;
		border: #09090a;
		background: white !important;
		margin-bottom: 0.8rem;

		padding: 0.3rem;
	}
	.radio-button {
		background: transparent !important;
		border: white 0.1rem solid !important;
		color: white !important;
		svg > * {
			fill: white;
		}

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
		// @include scrim(#221e2b42, 'to top', 0.65);
		// @include scrim(#000000ef, 'to top', 1);
		margin-bottom: 0.5rem;
		width: 100%;
		height: 100%;
	}
	.artist-thumbnail {
		display: block;
		position: relative;
		background: linear-gradient(360deg, #000 8.98%, rgba(0, 0, 0, 0) 100%);
		height: 100%;
		&::before {
			// background: linear-gradient(346deg, white, transparent);
			position: absolute;
			content: '';
			// width: 100%;
			// height: 100%;
			// background: linear-gradient(360deg, #000 8.98%, rgba(0, 0, 0, 0) 100%);
			box-shadow: 0rem 0rem 0.5rem 0.1rem rgba(19, 19, 20, 0.384);
			top: 0;
			bottom: 0;
			left: 0;
			/* z-index: 100; */
			/* margin-bottom: 5rem; */
			right: 0;
		}
	}
	.header-thumbnail {
		// position: absolute;
		z-index: -1;
		top: 0;
		width: 100%;
		max-height: 25%;
		overflow: hidden;

		&::before {
			position: absolute;
			content: '';
			top: 0;
			right: 0;

			background: linear-gradient(
				0.01turn,
				#09090a 8.98%,
				rgb(216 208 227 / 7%) 60%
			);
			// background: linear-gradient(1turn, #09090a 8.98%, #d29e9e05 67%);
			bottom: 0;
			left: 0;
			// @include scrim(#09090a, 'to top');
			// background: linear-gradient(360deg, #09090a 8.98%, rgba(0, 0, 0, 0) 100%);
			z-index: 1;
			transition: all cubic-bezier(0.42, 0, 0.58, 1) 0.2s !important;
			opacity: 1;
		}
	}
	.artist-content {
		position: relative;
		z-index: 5;
		.content-wrapper {
			position: absolute;
			bottom: 0;
			margin-bottom: 0.5rem;

			.description {
				display: block;
				padding: 0 2rem 2rem 2rem;
			}
			.name {
				font-size: 5em;
				font-weight: 700;
				display: inline-block;
				white-space: pre;
				padding: 0 2rem 0 2rem;
				text-shadow: rgba(0, 0, 0, 0.171) 0.2rem -0.12rem 0.5rem;

				@media screen and (max-width: 500px) {
					inline-size: 100%;
					overflow-wrap: break-word;
					font-size: 1.5rem;
					white-space: pre-line;
					padding: 1rem 0.8rem;
				}
				@media screen and (max-width: 700px) {
					inline-size: 100%;
					overflow-wrap: break-word;
					font-size: 0em;
					// padding: 0 2rem 0 1.5rem;
				}
				@media screen and (max-width: 850px) {
					inline-size: 100%;
					overflow-wrap: break-word;
					font-size: 3.5em;
				}
			}
		}
		@media screen and (max-width: 500px) {
			padding: 0.8rem;
		}
	}
	.gradient {
		@include scrim(#000000ef, 'to top', 1);
	}
	main {
		margin: 0;
		padding: 0;
	}
</style>
