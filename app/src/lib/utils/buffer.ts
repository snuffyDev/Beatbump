export type BufferEncoding = "utf8" | "utf-8" | "base64";

let encoder: TextEncoder;
if (TextEncoder) {
	encoder = new TextEncoder();
}

export class IsoBase64 {
	static toBase64(input: string): string {
		return btoa(input);
	}
	static fromBase64(input: string): string {
		return atob(input);
	}
}
