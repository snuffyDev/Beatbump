<script lang="ts">
	import { onMount } from "svelte";

	import type Peer from "peerjs";
	import { mod as ID } from "$lib/utils/id";
	let rtc: Peer;
	let client = {
		id: ID.generate(14)
	};

	onMount(async () => {
		const mod = await import("peerjs").then((module) => module.default);
		rtc = new mod({});
	});
</script>

<style src="./index.scss" lang="scss">
</style>
