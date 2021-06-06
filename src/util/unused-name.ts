/**
 * Returns an unique name among an array of existing, making it unique if need
 * be by adding a number at the end.
 */
export function unusedName(name: string, existing: string[]): string {
	if (existing.includes(name)) {
		let suffix = 1;

		while (existing.includes(`${name} ${suffix}`)) {
			suffix++;
		}

		return `${name} ${suffix}`;
	}

	return name;
}
