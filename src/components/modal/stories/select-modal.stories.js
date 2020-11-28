import SelectModal from '../select-modal';

export default {title: 'Modal/<select-modal>'};

export const normal = () => ({
	components: {SelectModal},
	template: `<select-modal
		detail="Sorry there aren't more choices."
		message="What's your favorite color?"
		:options="[{name: 'red'}, {name: 'green'}, {name: 'blue'}]"
		visible />`
});

export const loading = () => ({
	components: {SelectModal},
	template: `<select-modal
		detail="Sorry there aren't more choices."
		loading-message="Loading..."
		message="What's your favorite color?"
		:options="[{name: 'red'}, {name: 'green'}, {name: 'blue'}]"
		visible />`
});
