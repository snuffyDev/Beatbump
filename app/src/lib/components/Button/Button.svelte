<script lang="ts">
	import type { Icons } from "$components/Icon/icons";
	import Icon from "../Icon/Icon.svelte";

	export let icon: { name?: Icons; size?: string } = undefined;
	export let outlined = false;
	export let disabled = false;
	export let type: "button" | "reset" | "submit" | null = "button";
	let className = "";
	export { className as class };
</script>

<button
	{type}
	class="button {className}"
	class:outlined
	{disabled}
	on:click|preventDefault
	>{#if icon}<span>
			<Icon
				style="stroke-width: 2; display: inline-block; vertical-align: middle; font-size:inherit;"
				name={icon.name}
				size={icon.size ?? "1rem"}
			/>
		</span>{/if}<span>
		<slot />
	</span></button
>

<style lang="scss">
	button {
		display: inline-block;
		line-height: 1;
	}
	button > span {
		display: inline-block;
		vertical-align: middle;
		&:first-child {
			vertical-align: middle;
			margin-bottom: 0.1em;
		}
		padding-bottom: 0.1em;
		&:nth-child(2) {
			margin-top: 0.01em;
			margin-left: 0.3em;
		}
	}
</style>
