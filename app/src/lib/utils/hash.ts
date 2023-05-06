import { sortObj } from "./collections/objects";
import { Encoder } from "./strings";

const ChunkSizes = {
	8: 8150,
	16: 16300,
	32: 32600,
} as const;

function normalizeObject<T = Record<string, unknown>>(data: T) {
	const sortedObject = sortObj(data);
	const objString = JSON.stringify(sortedObject);
	const normalizedStr = objString.replace(/\s+/g, "");
	return normalizedStr;
}

export async function hash<T = Record<string, unknown>>(data: T): Promise<string> {
	const rawData = Encoder.encode(normalizeObject(data as unknown as Record<string, unknown>));
	const buffer = await crypto.subtle.digest("SHA-256", rawData);
	const hashString = Array.from(new Uint8Array(buffer))
		.map((bytes) => bytes.toString(16).padStart(2, "0"))
		.join("");
	return hashString;
}

export function chunk<T = Record<string, unknown>, Keys extends keyof typeof ChunkSizes = keyof typeof ChunkSizes>(
	src: T,
	size: Keys,
): {
	idx: number;
	data: Uint8Array;
	total: number;
}[] {
	const chunks: {
		idx: number;
		data: Uint8Array;
		total: number;
	}[] = [];
	const data = Encoder.encode(normalizeObject(src));
	const srcSize = data.buffer.byteLength;
	const dataSize = ChunkSizes[size];
	const chunkCount = Math.ceil(srcSize / dataSize);

	let idx = 0;
	let start = 0;
	while (start < size) {
		const end = Math.min(srcSize, start + dataSize);
		const dataChunk = data.slice(start, end);

		const chunk = {
			idx,
			data: dataChunk,
			total: chunkCount,
		};
		chunks.push(chunk);
		start = end;
		idx++;
	}
	return chunks;
}
