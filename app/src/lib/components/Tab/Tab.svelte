<script lang="ts">
	export let active: boolean = false;
</script>

<div class="tab" class:active on:click>
	<slot />
</div>

<style src="./index.scss" lang="scss">
</style>
