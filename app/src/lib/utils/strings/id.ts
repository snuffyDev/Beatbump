const charsets = {
	normal: "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",
	alternative: "useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict",
};
const mod = {
	generate: (size = 16, charset: "normal" | "alternative" = "normal") => {
		let id = "";
		let i = size;
		while (i--) {
			id += charsets[charset][(Math.random() * charsets[charset].length) | 0];
		}
		return id;
	},
};

export function generateId(size = 16, charset: "normal" | "alternative" = "normal"): string {
	return mod.generate(size, charset);
}
