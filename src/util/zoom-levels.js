export const descriptions = {
	large: 1,
	medium: 0.6,
	small: 0.25
};

export function describe(value) {
	let result;

	Object.keys(descriptions).forEach(d => {
		if (descriptions[d] === value) {
			result = d;
		}
	});

	return result;
}
