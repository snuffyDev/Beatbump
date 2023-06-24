<script>
	import { fade } from "svelte/transition";
	export let size = "3.5em";
</script>

<div
	id="vertical-loading-bars"
	style={`--size: ${size};  max-width: ${size};
    max-height: ${size}`}
	transition:fade|global
>
	<span />
	<span />
	<span />
	<span />
</div>

<style lang="scss">
	#vertical-loading-bars {
		margin: auto;
		display: flex;
		position: absolute;
		justify-content: center;

		/* flex-flow: row nowrap; */
		align-items: center;
		// justify-content: ;justify-content
		gap: 0.325em;
		inset: 0;
		z-index: 1;

		/* background: #000; */
		border-radius: 50%;
		background-blend-mode: multiply;
		background-color: rgb(0 0 0 / 18.4%);
		background: radial-gradient(
			circle at center,
			hsl(0deg 0% 0%) 10%,
			hsl(0deg 0% 0% / 54.3%) 24%,
			hsl(0deg 0% 0% / 38.8%) 50%,
			rgb(255 255 255 / 19.5%) 75%,
			rgb(255 255 255 / 0%) 100%
		);
	}

	#vertical-loading-bars span {
		width: 0.25rem;
		height: 1rem;
		background-color: #e7e9ee;
	}

	#vertical-loading-bars span:nth-of-type(1) {
		animation: grow 1s -0.45s ease-in-out infinite;
	}

	#vertical-loading-bars span:nth-of-type(2) {
		animation: grow 1s -0.3s ease-in-out infinite;
	}

	#vertical-loading-bars span:nth-of-type(3) {
		animation: grow 1s -0.15s ease-in-out infinite;
	}

	#vertical-loading-bars span:nth-of-type(4) {
		animation: grow 1s ease-in-out infinite;
	}

	@keyframes grow {
		0%,
		100% {
			transform: scaleY(1);
		}

		50% {
			transform: scaleY(2);
		}
	}
</style>
