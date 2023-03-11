<script lang="ts">
	import Icon from "../Icon/Icon.svelte";
	import type { Icons } from "$components/Icon/icons";

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
			name={icon.name}
			size={icon.size ?? "1em"}
		/>{/if}<slot /></button
>
