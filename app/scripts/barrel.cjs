#!/usr/bin/env node

const fs = require("fs");
const _path = require("path");

const BASE_PATH = _path.resolve(__dirname, "../src/lib/utils");

const makePath = (...str) => _path.join(...str);
const TypeExport = /(?<=export (?:enum|type|interface)[\s]?)(\w+)/gm;
const NormalExport = /(?<=export (?:function|const|class)[\s]?)(\w+)/gm;

function recursiveDirRead(path) {
	let skip = false;
	let directory = fs.readdirSync(path, { encoding: "utf-8" });

	const indexPath = makePath(path, "index.ts");
	fs.writeFileSync(indexPath, "", { encoding: "utf-8" });
	const dirs = [];
	directory.forEach((entry) => {
		if (fs.statSync(path + _path.sep + entry).isDirectory()) {
			dirs.push(entry);
			recursiveDirRead(makePath(path, entry));
		} else {
			if (skip) return;
			if (!fs.existsSync(makePath(path, "index.ts")))
				fs.writeFileSync(makePath(path, "index.ts"), "", { encoding: "utf-8" });
			if (entry === "index") return;
			const file = fs.readFileSync(makePath(path, entry), { encoding: "utf-8" });
			const $exports = [...new Set(file.match(NormalExport) || [])];
			const $typeExports = [...new Set(file.match(TypeExport) || [])];

			if ($typeExports.length > 0)
				fs.appendFileSync(
					makePath(path, "index.ts"),
					`export type { ${$typeExports.join(", ")} } from './${entry.slice(0, -3)}';\n`,
					{ encoding: "utf-8" },
				);
			if ($exports.length > 0)
				fs.appendFileSync(
					makePath(path, "index.ts"),
					`export { ${$exports.join(", ")} } from './${entry.slice(0, -3)}';\n`,
					{ encoding: "utf-8" },
				);
		}
	});
	dirs.forEach((item) => {
		fs.appendFileSync(indexPath, `export * from './${item}';\n`, { encoding: "utf-8" });
	});
}
recursiveDirRead(makePath(BASE_PATH, ""));
