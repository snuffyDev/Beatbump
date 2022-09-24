import { browser } from "$app/environment";

export type BufferEncoding = "utf8" | "utf-8" | "base64";

let encoder: TextEncoder;
if (TextEncoder) {
	encoder = new TextEncoder();
}
/// @ts-expect-error Static 'from' method override
export class Buffer extends Uint8Array {
	private constructor(value: ArrayBufferLike) {
		super(value);
	}
	/*ts a
	 * Creates a new Buffer instance from an existing Buffer or Uint8Array.
	 *
	 * @param buffer Buffer to use as the source for a new Buffer
	 */
	static override from<T extends ArrayBuffer | Buffer | Uint8Array>(
		buffer: T,
		byteOffset?: number,
		length?: number,
	): Buffer;
	/**
	 * Creates a new Buffer from a given string using the character
	 * encoding designated with `encoding`. If `encoding` is not provided,
	 * `utf-8` will be used as default.
	 *
	 * @param data string to use as the source for the Buffer
	 * @param encoding
	 */
	static override from(str: string, encoding?: BufferEncoding): Buffer;
	static override from(value: unknown, encodingOrOffset?: unknown, length?: unknown): unknown {
		if (typeof value === "string") {
			if (!encodingOrOffset || typeof encodingOrOffset !== "string") encodingOrOffset = "utf-8";

			const stringBuf = new TextEncoder().encode(value);
			const buffer = new Buffer(stringBuf);
			return buffer;
		}
		if (value instanceof ArrayBuffer || value instanceof Buffer || value instanceof Uint8Array) {
			const buffer = new Buffer(value as Uint8Array);
			return buffer;
		}
	}

	static alloc(size: number, fill?: string | Buffer | number, encoding?: BufferEncoding): Buffer {
		const buffer = new Uint8Array(size);

		if (fill !== undefined) {
			if (typeof encoding === "string") {
				buffer.fill(size);

				return new Buffer(buffer);
			} else return new Buffer(buffer);
		} else return new Buffer(buffer);
	}
	/// @ts-expect-error ToString override
	public override toString(encoding: BufferEncoding): string {
		if (encoding === "utf-8") {
			return new TextDecoder().decode(this, { stream: false });
		}
	}

	[Symbol.iterator] = function* (this: Buffer): IterableIterator<number> {
		const length = this.length;
		let idx = -1;
		while (++idx < length) {
			yield this[idx];
		}
	};

	static [Symbol.hasInstance](instance: unknown): boolean {
		return instance instanceof Buffer;
	}
}
export class IsoBase64 {
	static toBase64(input: string): string {
		return btoa(input);
	}
	static fromBase64(input: string): string {
		return atob(input);
	}
}
