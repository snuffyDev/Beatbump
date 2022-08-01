let encoder: TextEncoder;
let decoder: TextDecoder;

export class Encoder {
	static encode(input: string): Uint8Array {
		if (!encoder) {
			encoder = new TextEncoder();
		}
		return encoder.encode(input);
	}
	static decoder(input: Uint8Array, options: TextDecodeOptions = { stream: false }): string {
		return decoder.decode(input, options);
	}
}
export const BLACKLISTED_CHARS = new Set([
	";",
	"(",
	")",
	"'",
	'"',
	"`",
	";",
	".",
	"%",
	"*",
	"!",
	"@",
	"#",
	"$",
	"^",
	"&",
	"=",
	"+",
	"{",
	"}",
	"~",
	"[",
	"]",
	"\\",
	"\\\\",
	",",
	"/",
	"|",
	"<",
	">",
	"?",
	":",
]);

export function sanitize(str: string): string {
	if (typeof str !== "string") return;
	return str
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\//g, "&#x2F;")
		.replace(/\\/g, "&#x5C;")
		.replace(/`/g, "&#96;");
}
