import ButtonCard from '../button-card';
import IconButton from '../../control/icon-button';

export default {title: 'Container/<button-card>'};

export const normal = () => ({
	components: {ButtonCard, IconButton},
	template: `
		<button-card>
			<icon-button icon="edit">Edit</icon-button>
			<icon-button icon="trash-2" type="danger">Delete</icon-button>
		</button-card>`
});
