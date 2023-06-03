<script lang="ts">
	export let chip: {
		text: string;
		browseEndpoint: { browseId: string; params: string };
		ctoken?: string;
	};
	export let selected = false;
</script>

<a
	role="button"
	class="chip"
	class:selected
	href={selected === false
		? `/home?params=${chip.browseEndpoint.params}`
		: "/home"}
	on:click
>
	{chip.text}
</a>

<style
	src="./index.scss"
	lang="scss"
>
</style>
