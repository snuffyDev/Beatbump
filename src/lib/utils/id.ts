export const mod = {
	charset: "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",
	generate: (size = 16) => {
		let id = "";
		let i = size;
		while (i--) {
			id += mod.charset[(Math.random() * mod.charset.length) | 0];
		}
		return id;
	}
};
