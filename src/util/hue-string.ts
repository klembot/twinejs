/**
 * Generates a hue (as in the HSL colorspace) for a string.
 */
export function hueString(value: string): number {
	let result = 0;

	for (let i = 0; i < value.length; i++) {
		result += value.charCodeAt(i);
	}

	return result % 360;
}
