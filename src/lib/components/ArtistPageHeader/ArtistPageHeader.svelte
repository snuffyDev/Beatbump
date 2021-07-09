<script>
	import { getData } from '$lib/utils'
	import { page } from '$app/stores'

	import { onMount } from 'svelte'
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
	@import '../../../global/vars.css';
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

			// background: linear-gradient(
			// 	0turn,
			// 	#09090a 0%,
			// 	#0b0b0b 1.2%,
			// 	#0a0a0bed 14.98%,
			// 	#1313149e 23%,
			// 	#14141440 38%,
			// 	#ababaf17
			// );
			// background: linear-gradient(
			// 	0turn,
			// 	#09090a,
			// 	#0b0b0b 1.2%,
			// 	rgba(10, 10, 11, 0.9294117647058824) 14.98%,
			// 	rgb(12 12 13 / 85%) 24%,
			// 	rgb(19 19 20 / 65%) 36%,
			// 	rgb(19 19 20 / 51%) 50%,
			// 	rgb(20 20 20 / 16%) 70%,
			// 	rgb(171 171 175 / 0%) 100%
			// );
			background: linear-gradient(
				360deg,
				var(--dark-base) 8.98%,
				rgba(0, 0, 0, 0) 100%
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
		z-index: 1;
		.content-wrapper {
			position: absolute;
			bottom: 0;
			margin-bottom: 0.5rem;

			.description {
				display: block;
				padding: 0 2rem 2rem 2rem;
			}
			.name {
				font-weight: 700;
				font-size: 2.5rem;
				display: inline-block;
				// white-space: pre;
				text-shadow: rgba(0, 0, 0, 0.171) 0.2rem -0.12rem 0.5rem;

				padding: 0.8em 0 0.8rem 0.5rem;
				// @media screen and (max-width: 550px) {
				// 	// padding: 0 2rem 0 2rem;
				// 	color: red;
				// }
				// @media screen and (max-width: 600px) {
				// 	inline-size: 100%;
				// 	overflow-wrap: break-word;
				// 	font-size: 3.5rem;
				// 	// white-space: pre-line;
				// 	// padding: 1rem 0.8rem;
				// 	// padding: 0 2rem 0 2rem;

				// 	padding: 0em 0 0 0.2em;
				// }

				@media (min-width: 320px) and (max-width: 499px) {
					padding: 0.8em 0 0.8rem 0.5rem;
				}
				@media (min-width: 500px) and (max-width: 640px) {
					padding: 0.8em 0 0.8rem 1.8rem;
				}
				@media screen and (min-width: 642px) and (max-width: 839px) {
					font-size: 2rem;
					// color: pink;
					padding: 0.8em 0 0.8rem 2rem;
				}
				@media screen and (min-width: 840px) and (max-width: 960px) {
					font-size: 3.5rem;
					// color: orange;
					inline-size: 100%;
					overflow-wrap: break-word;

					// font-size: 2.75em;
					padding: 0 2rem 0.8rem 2rem;
				}
				@media screen and (min-width: 961px) {
					padding: 0 2rem 0.8rem 2rem;
					font-size: 4.5rem;
				}

				// @media screen and (min-width: 641px) {
				// 	inline-size: 100%;
				// 	overflow-wrap: break-word;
				// 	padding: 2rem 0 0 2rem;

				// 	font-size: 3.5em; // padding: 0 2rem 0 1.5rem;
				// }
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
