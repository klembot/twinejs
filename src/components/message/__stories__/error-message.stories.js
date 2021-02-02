import ErrorMessage from '../error-message.vue';

export default {title: 'Message/<error-message>'};

export const normal = () => ({
	components: {ErrorMessage},
	template: '<error-message>Uh oh.</error-message>'
});
