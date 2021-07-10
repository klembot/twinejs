// Packages we use but don't have types.

declare module 'focus-visible' {}

declare module 'segseg' {
	// See https://github.com/tmpvar/segseg/blob/master/index.js

	export type SegSegVector = [number, number];

	export default function (
		out: SegSegVector,
		p1: SegSegVector,
		p2: SegSegVector,
		p3: SegSegVector,
		p4: SegSegVector
	): boolean;
}

declare module 'tiny-uuid' {
	export default function (): string;
}
