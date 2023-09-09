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
	>{#if icon}<Icon
			style="stroke-width: 2.5; display: inline-block; vertical-align: middle;"
			name={icon.name}
			size={icon.size ?? "1em"}
		/>{/if}<span>
		<slot />
	</span></button
>

<style lang="scss">
	button {
		display: inline-block;
	}
	button > span {
		padding-bottom: 0.1825rem;
		line-height: 1;
		margin-left: 0.25rem;
		display: inline-block;
		vertical-align: middle;
	}
</style>
