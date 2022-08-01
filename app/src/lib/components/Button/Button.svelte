<script lang="ts">
	import Icon from "../Icon/Icon.svelte";
	import "../../../global/stylesheet/modules/_button.scss";
	export let icon: { name?: string; size?: string } = undefined;
	export let outlined = false;
	export let disabled = false;
	export let type = "button";
	let className = "";
	export { className as class };
</script>

<button {type} class="button {className}" class:outlined {disabled} on:click|preventDefault
	>{#if icon}<Icon name={icon.name} size={icon.size ?? "1em"} />{/if}<slot /></button
>
