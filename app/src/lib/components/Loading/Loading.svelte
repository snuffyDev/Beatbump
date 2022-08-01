<script>
	import { fade } from "svelte/transition";
	export let size = "4em";
</script>

<div
	id="vertical-loading-bars"
	style={` max-width: ${size};
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
		justify-content: space-evenly;

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
		background-blend-mode: luminosity;
		background: rgb(0, 0, 0);
		background: -moz-radial-gradient(circle, rgba(0, 0, 0, 0.658) 32%, rgba(136, 136, 136, 0.06066176470588236) 99%);
		background: -webkit-radial-gradient(circle, rgba(0, 0, 0, 0.658) 32%, rgba(136, 136, 136, 0.06066176470588236) 99%);
		background: radial-gradient(circle, rgba(0, 0, 0, 0.658) 32%, rgba(136, 136, 136, 0.06066176470588236) 99%);
	}
	#vertical-loading-bars span {
		width: 0.3em;
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
