<script lang="ts">
	import { getContext } from "svelte";
	import Icon from "../Icon/Icon.svelte";

	export let text = "";
	export let icon = "";
	export let color = "white";

	getContext("menu");
</script>

<div class="popout-item" style="color:{color}" on:click>
	<Icon name={icon} color="white" size="1.25em" />
	<div class="po-text">{text}</div>
</div>

<style lang="scss">
	.po-text {
		display: inline-block;
		margin-left: 0.5em;
		font-size: 1em;
		white-space: nowrap;
		color: inherit;
	}
	.popout-item {
		z-index: 5;
		display: flex;
		flex-direction: row;
		/* backdrop-filter: opacity(0); */
		padding: 0.8rem;
		align-items: center;
		cursor: pointer;
		margin: 0;
		border-bottom: 0.0714rem solid #313338;
		color: #fff9f9;
		// background-color: #1a1a20;
		position: relative;
		// filter: drop-shadow(0rem 0.25rem 0.2rem rgba(0, 0, 0, 0.342));
		// box-shadow: 0em 0.5em 0.5em 0em #1f1f1f40;
		&:hover {
			color: #fcf6f6;
			background-color: #585869;
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 75ms;
		}
		&:active {
			background-color: #a0a0b1;

			transition: cubic-bezier(0.68, -0.55, 0.265, 1.55) all 0.3s;
		}
		&:first-child {
			border-top-left-radius: inherit;
			border-top-right-radius: inherit;
		}
		&:last-of-type {
			border-bottom-left-radius: inherit;
			border-bottom-right-radius: inherit;
			border-bottom: none !important;
		}
	}
</style>
