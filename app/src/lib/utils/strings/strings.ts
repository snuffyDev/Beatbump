let encoder: TextEncoder;
let decoder: TextDecoder;

export class Encoder {
	public static decoder(
		input: Uint8Array,
		options: TextDecodeOptions = { stream: false },
	): string {
		return decoder.decode(input, options);
	}

	public static encode(input: string): Uint8Array {
		if (!encoder) {
			encoder = new TextEncoder();
		}
		return encoder.encode(input);
	}
}

export function normalizeURIEncoding(str: string): string {
	try {
		const decodedStr = decodeURIComponent(str);
		const reencodedStr1 = encodeURIComponent(decodedStr);
		const reencodedStr2 = encodeURIComponent(reencodedStr1);
		return reencodedStr2 === str ? str : reencodedStr2;
	} catch (e) {
		return encodeURIComponent(str);
	}
}

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
