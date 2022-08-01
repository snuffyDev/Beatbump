import { readdirSync, existsSync, cpSync } from "fs";
import { join, resolve } from "path";
const BASE_PATH = resolve(".");
const COMP_DIR = resolve("../src/lib/components");
const MIGRATION_DIR = resolve("../src/lib/_migration");

const IS_OK = new Set<string>([]);
const NEEDS_MIGRATION = new Set<string>([]);
function readCompDirectory(path: string) {
	if (!existsSync(join(path, "index.ts"))) {
		NEEDS_MIGRATION.add(path);
		return;
	}
	readdirSync(path, { encoding: "utf-8" }).forEach((file) => {});
}
