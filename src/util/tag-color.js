export const tagColors = ['none', 'red', 'orange', 'green', 'blue', 'purple'];

export function isTagColor(value) {
	return tagColors.includes(value);
}

export default isTagColor;
