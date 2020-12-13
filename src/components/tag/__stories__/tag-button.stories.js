import TagButton from '../tag-button';

const makeStory = color => () => ({
	components: {TagButton},
	template: `<tag-button color=${color.toLowerCase()} label="${color}" />`
});

export default {title: 'Tag/<tag-button>'};

export const gray = makeStory('Gray');
export const red = makeStory('Red');
export const orange = makeStory('Orange');
export const yellow = makeStory('Yellow');
export const green = makeStory('Green');
export const blue = makeStory('Blue');
export const purple = makeStory('Purple');
