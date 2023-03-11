<script>
	import { fade } from "svelte/transition";
	export let size = "3.5em";
</script>

<div
	id="vertical-loading-bars"
	style={`--size: ${size};  max-width: ${size};
    max-height: ${size}`}
	transition:fade
>
	<span />
	<span />
	<span />
	<span />
</div>

<style lang="scss">
	#vertical-loading-bars {
		margin-right: auto;
		display: flex;
		position: absolute;
		justify-content: center;
		/* flex-flow: row nowrap; */
		align-items: center;
		// justify-content: ;
		gap: 0.325em;
		top: 0;
		z-index: 1;
		right: 0;
		/* background: #000; */
		left: 0;
		margin-left: auto;
		bottom: 0;
		margin-top: auto;
		margin-bottom: auto;
		border-radius: 50%;
		background-blend-mode: multiply;
		background-color: rgba(0, 0, 0, 0.184);
		background: radial-gradient(
			circle at center,
			hsl(0, 0%, 0%) 10%,
			hsla(0, 0%, 0%, 0.543) 24%,
			hsla(0, 0%, 0%, 0.388) 50%,
			rgba(255, 255, 255, 0.195) 75%,
			rgba(255, 255, 255, 0) 100%
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
