export function isValidTagName(value: string) {
	return value.length > 0 && !/\s/.test(value);
}
