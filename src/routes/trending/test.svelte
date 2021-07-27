<script lang="ts">
	import Loading from '$components/Loading/Loading.svelte'
</script>

<div class="player-spinner" />

<style lang="scss">
	.player-spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		justify-self: center;
		width: 2em;
		// background: white;
		height: 2em;
		border: rgba(255, 255, 255, 0.26) solid 0.25em;
		border-radius: 50%;
		border-top-color: rgba(255, 255, 255, 0.904);
		animation: loading 1s infinite cubic-bezier(0.785, 0.135, 0.15, 0.86);
		width: 2em;
		opacity: 0;
		// background: white;
		transition: all ease-in-out 1s;
		&.fade-out {
			opacity: 1;
			transition: all ease-in-out 1s;
		}
		height: 2em;
	}
	@keyframes loading {
		to {
			transform: rotate(360deg);
		}
	}
</style>
