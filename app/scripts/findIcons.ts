import * as fs from "fs";
import * as path from "path";
const RE_ICONS = /(?<=icon:.*")[\w-]+|.^$/gm;
const RE_TEXT = /(?<=text:.*").[a-zA-Z ]+|.^$/gm;
const RE_OBJ = /(\{)\n.*((text|icon|action):[\s\S]+?){3}\},([\s\S]+?).+?\}/gm;

const PATH_TO_SRC = path.resolve("./src");
const objects: Map<
	string,
	{ text: string; icon: string; action: Promise<void> | void }
> = new Map();
function recurse(fPath: string) {
	const join = (str: string) => path.join(fPath, str);
	const directory = fs.readdirSync(fPath, { encoding: "utf-8" });
	const icons = new Set<string>([]);
	const text = new Set<string>([]);
	const keys = new Set<string>([]);

	for (const item in directory) {
		let result;
		if (fs.statSync(join(item)).isDirectory()) {
			const res = recurse(join(item));
			Object.keys(res).forEach((key) => {
				const set = res[key] as Set<
					string & { text: string; icon: string; action: Promise<void> | void }
				>;

				if (key === "text") {
					for (const item of set) {
						text.add(item);
					}
				}

				if (key === "icons") {
					for (const item of set) {
						icons.add(item);
					}
				} else if (item.includes(".svelte")) {
					const file = fs.readFileSync(join(item), { encoding: "utf-8" });

					const hasIcons = file.match(RE_ICONS);
					const hasText = file.match(RE_TEXT);
					const hasObject = file
						.match(/(?<=<\/?script(?:.*)>)[\s\S]+(?=<\/?script(?:.*)>)/gm)
						?.at(-1)
						.match(RE_OBJ);
					if (hasObject) {
						hasObject.forEach((obj) => {
							try {
								const _this = new Function(`return (${obj})`)();

								if (!keys.has(_this["text"])) {
									keys.add(_this["text"]);
								}

								objects.set(`${_this.text}`, _this);
							} catch (err) {
								console.error(`PATH: ${join(item)}\n`, new Error(err));
							}
						});
					}

					if (hasIcons) {
						hasIcons.forEach((match) => {
							if (icons.has(match)) return;
							else icons.add(match);
						});
					}
					if (hasText) {
						hasText.forEach((match) => {
							if (text.has(match)) return;
							else text.add(match);
						});
					}
				}
			});
		}
	}
	return { objects: Object.fromEntries(objects.entries()) };
}
fs.writeFileSync("./scripts/icons.json", JSON.stringify(recurse(PATH_TO_SRC)), {
	encoding: "utf-8",
});
