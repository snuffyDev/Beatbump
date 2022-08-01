import { spawn } from "child_process";
import { Logger } from "../build";

export function spawnTask(command: string, args: string[]) {
	return spawn(command, args, { stdio: "inherit" });
}
